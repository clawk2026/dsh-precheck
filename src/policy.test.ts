import assert from "node:assert/strict";
import test from "node:test";
import { decide } from "./policy.js";
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
