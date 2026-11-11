import assert from "node:assert/strict";
import test from "node:test";
import { decide, formatReport } from "./policy.js";
import type { ResolveResult } from "./resolve.js";

function base(over: Partial<ResolveResult> = {}): ResolveResult {
  return {
    status: "ok",
    grade: "green",
    slug: "dsh:owner/repo",
    source: "catalog",
    ...over,
  };
}

function rich(over: Partial<ResolveResult> = {}): ResolveResult {
  return base({
    grade: "red",
    source: "resolve",
    findingCount: 2,
    trustScore: 75,
    gradeEvidenceBasis: "code",
    authorVerified: false,
    lastScannedAt: "2026-08-21T02:41:47Z",
    lastSeenAt: "2026-11-10T14:29:14Z",
    findings: [
      {
        ruleId: "R3_remote_code_exec",
        severity: "P0",
        category: "确定性危险",
        filePath: "README.md",
        lineNo: 59,
        evidence: "curl -fsSL https://antigravity.google/cli/install.sh | bash",
        evidenceTier: 3,
        pathClass: "doc",
      },
      {
        ruleId: "CAP_network_access",
        severity: "P2",
        category: "待定",
        filePath: null,
        lineNo: 0,
        evidence: "external endpoints require API keys",
        evidenceTier: null,
        pathClass: null,
      },
    ],
    capabilities: [
      {
        name: "remote_code_exec",
        level: 4,
        confidence: "high",
        evidenceTier: 3,
        evidenceClass: "doc",
      },
    ],
    ...over,
  });
}

const NOW = new Date("2026-11-11T00:00:00Z");

test("strict blocks pinned ref even when grade is green", () => {
  const d = decide(base({ requestedRef: "v2" }), { strict: true });
  assert.equal(d.action, "block");
  assert.match((d as { reason: string }).reason, /pinned ref 'v2'/);
});

test("advisory allows green with pinned ref but notes it", () => {
  const d = decide(base({ requestedRef: "v2" }), {});
  assert.equal(d.action, "allow");
  assert.match(d.reason, /v2/);
});

test("force overrides strict pinned block", () => {
  const d = decide(base({ requestedRef: "v2" }), { strict: true, force: true });
  assert.equal(d.action, "allow");
});

test("report shows file:line evidence and evidence tier", () => {
  const out = formatReport(rich(), NOW);
  assert.match(out, /P0 R3_remote_code_exec \[README\.md:59\] tier=3 doc/);
  assert.match(out, /curl -fsSL/);
  assert.match(out, /capability remote_code_exec level=4 confidence=high tier=3 class=doc/);
});

test("report marks findings without a code reference", () => {
  const out = formatReport(rich(), NOW);
  assert.match(out, /CAP_network_access \[no file:line reference\]/);
});

test("trust score is explicitly not a verdict", () => {
  const out = formatReport(rich(), NOW);
  assert.match(out, /trustScore=75 \(score is NOT a verdict/);
  assert.match(out, /basis=code/);
});

test("coverage gaps are always stated, even for a green grade", () => {
  const green = formatReport(base(), NOW);
  assert.match(green, /-- not assessed --/);
  assert.match(green, /runtime behavior=NOT executed/);
  assert.match(green, /pinned ref \/ tarball \/ local dir \/ dependency OSV=NOT assessed/);
  assert.match(green, /author identity=unknown/);
  assert.match(green, /advisory only — NOT a security guarantee/);
});

test("unverified author is called out when backend reports it", () => {
  assert.match(formatReport(rich(), NOW), /author identity=UNVERIFIED/);
});

test("stale scan produces a warning, fresh scan does not", () => {
  assert.match(formatReport(rich(), NOW), /WARNING grade is based on a \d+-day-old scan/);
  assert.match(formatReport(rich(), NOW), /last scanned=2026-08-21T02:41:47Z/);
  const fresh = formatReport(rich({ lastScannedAt: "2026-11-10T00:00:00Z" }), NOW);
  assert.doesNotMatch(fresh, /WARNING/);
});

test("missing scan timestamp is flagged, not silently treated as fresh", () => {
  const out = formatReport(rich({ lastScannedAt: null }), NOW);
  assert.match(out, /last scanned=not reported/);
  assert.match(out, /WARNING scan timestamp not reported by backend/);
});

test("thin catalog fallback says evidence is unavailable instead of inventing it", () => {
  const out = formatReport(base({ evidenceLimited: true, findingCount: 7 }), NOW);
  assert.match(out, /per-finding evidence not available/);
  assert.match(out, /grade here comes from a thin index/);
  assert.doesNotMatch(out, /capability /);
  assert.doesNotMatch(out, /basis=/);
});

test("report still starts with the machine-parseable grade line", () => {
  assert.equal(
    formatReport(rich(), NOW).split("\n")[0],
    "[dsh-precheck] grade=High risk (red) status=ok"
  );
});

test("rich evidence does not change the install decision", () => {
  assert.equal(decide(rich(), {}).action, "block");
  assert.equal(decide(rich({ grade: "green" }), {}).action, "allow");
  assert.equal(decide(rich({ grade: "green" }), { strict: true }).action, "allow");
});
