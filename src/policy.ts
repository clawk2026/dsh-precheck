/** Install policy: red block, orange confirm, fail-soft otherwise. */

import * as readline from "node:readline";
import { CLI_NAME } from "./constants.js";
import type { Grade, ResolveResult } from "./resolve.js";

export type PolicyDecision =
  | { action: "allow"; reason: string }
  | { action: "block"; reason: string; exitCode: number }
  | { action: "confirm"; reason: string };

const GRADE_LABEL: Record<Grade, string> = {
  green: "Clear",
  yellow: "Watch",
  orange: "Caution",
  red: "High risk",
  unknown: "Pending",
};

/**
 * Decide what to do with a resolved plugin.
 *
 * Modes:
 *  - `--force`           : always allow (overrides everything but a terminal error).
 *  - `--strict`          : fail-closed — block any plugin that is not positively
 *                          verified (error / missing / scanning / unknown grade).
 *  - default (advisory)  : fail-soft — unverified plugins are allowed but the
 *                          reason string makes clear this is NOT a security
 *                          guarantee. The tool is a soft gate, not a hard wall.
 *
 * `terminal` results (malformed specs) are handled by the caller and never
 * reach an allow decision here.
 */
export function decide(
  result: ResolveResult,
  opts: { force?: boolean; yes?: boolean; strict?: boolean }
): PolicyDecision {
  if (opts.force) {
    return { action: "allow", reason: "Forced with --force" };
  }

  if (result.status === "skipped") {
    return { action: "allow", reason: result.message || "Skipped" };
  }

  if (opts.strict) {
    // Pinned refs (github:owner/repo#v2) are looked up at default-branch
    // granularity only — refuse in strict mode even if that branch is green.
    if (result.requestedRef) {
      return {
        action: "block",
        reason: `Strict mode: pinned ref '${result.requestedRef}' is not separately assessed (catalog covers the default branch only). Refusing to install.`,
        exitCode: 2,
      };
    }
    // Fail-closed: refuse anything that is not a positively cleared grade
    // (green / yellow). Verified-but-suspicious (orange / red) and everything
    // unverified (error / missing / scanning / unknown) are all blocked.
    const blocked =
      result.status === "error" ||
      result.status === "missing" ||
      result.status === "scanning" ||
      result.grade === "unknown" ||
      result.grade === "orange" ||
      result.grade === "red";
    if (blocked) {
      return {
        action: "block",
        reason: `Strict mode: plugin is NOT cleared (grade=${result.grade}, status=${result.status}). Refusing to install.`,
        exitCode: 2,
      };
    }
  }

  if (result.status === "error") {
    return {
      action: "allow",
      reason: `Lookup failed (${result.message || "error"}). ADVISORY ONLY — unverified plugins may be unsafe; install allowed (use --strict to block).`,
    };
  }

  if (result.status === "missing" || result.status === "scanning" || result.grade === "unknown") {
    const refNote = result.requestedRef
      ? ` You requested ref '${result.requestedRef}'; trust data covers the default branch only and cannot attest a pinned commit.`
      : "";
    return {
      action: "allow",
      reason: `No grade yet (${result.status}). ADVISORY ONLY — unverified${refNote}; install allowed (use --strict to block).`,
    };
  }

  if (result.grade === "red") {
    return {
      action: "block",
      reason: `Blocked: grade is High risk (red). Re-run with --force to override.`,
      exitCode: 2,
    };
  }

  if (result.grade === "orange") {
    if (opts.yes) {
      return { action: "allow", reason: "Caution grade accepted with --yes" };
    }
    return {
      action: "confirm",
      reason: `Caution (orange): review evidence before installing.`,
    };
  }

  return {
    action: "allow",
    reason: result.requestedRef
      ? `Grade ${GRADE_LABEL[result.grade]} — OK to install (note: requested ref '${result.requestedRef}' is not separately assessed; grade is for the default branch)`
      : `Grade ${GRADE_LABEL[result.grade]} — OK to install`,
  };
}

const STALE_SCAN_DAYS = 30;
const MAX_FINDINGS_SHOWN = 5;
const MAX_EVIDENCE_CHARS = 120;

function clip(s: string, n = MAX_EVIDENCE_CHARS): string {
  const oneLine = s.replace(/\s+/g, " ").trim();
  return oneLine.length > n ? `${oneLine.slice(0, n - 1)}…` : oneLine;
}

function parseStamp(s?: string | null): number | null {
  if (!s) return null;
  const t = Date.parse(s.includes("T") ? s : s.replace(" ", "T"));
  return Number.isFinite(t) ? t : null;
}

/**
 * Human-readable report. Deliberately separates three things that a single
 * score conflates: (1) the risk grade, (2) how well that grade is evidenced,
 * (3) what was never checked at all. `decide()` below is intentionally
 * untouched — this is presentation only, no policy or exit-code change.
 */
export function formatReport(result: ResolveResult, now: Date = new Date()): string {
  const p = `[${CLI_NAME}]`;
  const lines: string[] = [];

  // 1. Verdict — first line kept byte-compatible with the previous report.
  lines.push(`${p} grade=${GRADE_LABEL[result.grade]} (${result.grade}) status=${result.status}`);
  if (result.slug) lines.push(`${p} slug=${result.slug}`);
  if (result.name) lines.push(`${p} name=${result.name}`);
  if (result.findingCount != null) lines.push(`${p} evidence=${result.findingCount}`);
  if (result.requestedRef) lines.push(`${p} requestedRef=${result.requestedRef}`);

  // 2. Evidence quality — separate from the grade itself.
  lines.push(`${p} -- evidence --`);
  const hasRich = Array.isArray(result.findings) || Array.isArray(result.capabilities);
  if (result.evidenceLimited || !hasRich) {
    lines.push(
      `${p} per-finding evidence not available for this lookup (ungraded / queued / thin catalog / lookup error)`
    );
    lines.push(`${p} grade here comes from a thin index — see the details URL for evidence`);
  } else {
    const scoreNote =
      result.trustScore != null
        ? ` trustScore=${result.trustScore} (score is NOT a verdict; grade above is authoritative)`
        : " trustScore=not reported";
    lines.push(`${p} basis=${result.gradeEvidenceBasis || "not reported"}${scoreNote}`);

    const all = result.findings || [];
    for (const f of all.slice(0, MAX_FINDINGS_SHOWN)) {
      const sev = f.severity || "?";
      const rule = f.ruleId || "unnamed rule";
      const loc = f.filePath
        ? `${f.filePath}${f.lineNo ? `:${f.lineNo}` : ""}`
        : "no file:line reference";
      const tier = f.evidenceTier != null ? ` tier=${f.evidenceTier}` : "";
      const cls = f.pathClass ? ` ${f.pathClass}` : "";
      const ev = f.evidence ? ` — ${clip(f.evidence)}` : "";
      lines.push(`${p} ${sev} ${rule} [${loc}]${tier}${cls}${ev}`);
    }
    if (all.length > MAX_FINDINGS_SHOWN) {
      lines.push(`${p} +${all.length - MAX_FINDINGS_SHOWN} more findings — see details URL`);
    }
    for (const c of (result.capabilities || []).slice(0, 3)) {
      const bits = [
        c.name || "capability",
        c.level != null ? `level=${c.level}` : null,
        c.confidence ? `confidence=${c.confidence}` : null,
        c.evidenceTier != null ? `tier=${c.evidenceTier}` : null,
        c.evidenceClass ? `class=${c.evidenceClass}` : null,
      ].filter((x): x is string => x !== null);
      lines.push(`${p} capability ${bits.join(" ")}`);
    }
  }

  // 3. Coverage gaps — always shown, including for green grades.
  lines.push(`${p} -- not assessed --`);
  const authorLabel =
    result.authorVerified === true
      ? "linked identity on file"
      : result.authorVerified === false
        ? "UNVERIFIED (no linked GitHub/npm identity)"
        : "unknown (source did not report)";
  lines.push(`${p} author identity=${authorLabel}`);
  lines.push(`${p} runtime behavior=NOT executed (a static scan cannot prove what runs)`);
  lines.push(`${p} pinned ref / tarball / local dir / dependency OSV=NOT assessed`);
  lines.push(`${p} catalog granularity=default branch only`);

  // 4. Freshness — "last seen" is not "last scanned".
  if (result.lastScannedAt || result.lastSeenAt) {
    lines.push(`${p} -- freshness --`);
    lines.push(`${p} last scanned=${result.lastScannedAt || "not reported"}`);
    if (result.lastSeenAt) lines.push(`${p} last seen=${result.lastSeenAt}`);
    const scanned = parseStamp(result.lastScannedAt);
    if (scanned == null) {
      // The FC API does not always return last_scanned_at. Do not let a
      // missing timestamp quietly read as "fresh".
      lines.push(
        `${p} WARNING scan timestamp not reported by backend; grade freshness cannot be verified`
      );
    } else {
      const days = Math.floor((now.getTime() - scanned) / 86_400_000);
      if (days >= STALE_SCAN_DAYS) {
        lines.push(
          `${p} WARNING grade is based on a ${days}-day-old scan; re-check before relying on it`
        );
      }
    }
  }

  // 5. Source.
  if (result.detailUrl) lines.push(`${p} details=${result.detailUrl}`);
  if (result.message) lines.push(`${p} note=${result.message}`);
  if (result.source) lines.push(`${p} source=${result.source}`);
  lines.push(`${p} advisory only — NOT a security guarantee`);
  return lines.join("\n");
}

export async function confirm(prompt: string): Promise<boolean> {
  if (!process.stdin.isTTY) return false;
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
  const answer: string = await new Promise((resolve) => {
    rl.question(`${prompt} [y/N] `, (a) => {
      rl.close();
      resolve(a || "");
    });
  });
  return /^\s*y(es)?\s*$/i.test(answer);
}
