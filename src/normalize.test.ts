import assert from "node:assert/strict";
import test from "node:test";
import { extractAddTarget, parseInstallSpec } from "./normalize.js";

test("parse github: and URLs", () => {
  const a = parseInstallSpec("github:liustack/modlens#main");
  assert.equal(a.ok && a.path, "liustack/modlens");
  const b = parseInstallSpec("https://github.com/ZSeven-W/dsh-noema.git");
  assert.equal(b.ok && b.dshSlug, "dsh:ZSeven-W/dsh-noema");
  const c = parseInstallSpec("dsh:owner/repo");
  assert.equal(c.ok && c.githubSlug, "github:owner/repo");
});

test("parse link skips check", () => {
  const a = parseInstallSpec("link:/tmp/x");
  assert.equal(a.ok && a.skipCheck, true);
});

test("extractAddTarget", () => {
  assert.equal(
    extractAddTarget(["--profile", "web", "add", "github:a/b"]),
    "github:a/b"
  );
  assert.equal(extractAddTarget(["list"]), null);
});
