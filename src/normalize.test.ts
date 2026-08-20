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

test("parse retains ref without dropping it", () => {
  const a = parseInstallSpec("github:liustack/modlens#v2");
  assert.equal(a.ok && a.path, "liustack/modlens");
  assert.equal(a.ok && a.ref, "v2");
  const b = parseInstallSpec("github:liustack/modlens");
  assert.equal(b.ok && b.ref, undefined);
  const c = parseInstallSpec("dsh:owner/repo#main");
  assert.equal(c.ok && c.ref, "main");
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

test("extractAddTarget skips value-taking flags", () => {
  // --tag v1.0 must not be mistaken for the target
  assert.equal(
    extractAddTarget(["--profile", "web", "add", "--tag", "v1.0", "github:a/b"]),
    "github:a/b"
  );
  // inline --key=value form
  assert.equal(
    extractAddTarget(["add", "--tag=v1.0", "github:a/b"]),
    "github:a/b"
  );
  // --branch with value
  assert.equal(
    extractAddTarget(["add", "--branch", "dev", "github:a/b"]),
    "github:a/b"
  );
});
