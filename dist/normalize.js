/** Parse dsh plugin install specs into owner/repo when possible. */
const OWNER_REPO = /^[\w.-]+\/[\w.-]+$/;
const NPM_NAME = /^(@[\w.-]+\/)?[\w.-]+$/;
const GH_URL = /github\.com[/:]([^/\s?#]+)\/([^/\s?#]+)/i;
function fromOwnerRepo(owner, repo, raw, kind, ref) {
    const clean = repo.replace(/\.git$/i, "").replace(/\/+$/, "");
    if (!owner || !clean) {
        return { ok: false, raw, error: "expected owner/repo" };
    }
    const base = `${owner}/${clean}`;
    return {
        ok: true,
        raw,
        kind,
        owner,
        repo: clean,
        path: base,
        ref,
        dshSlug: `dsh:${base}`,
        githubSlug: `github:${base}`,
    };
}
/**
 * Extract the ref (the part after `#`) if present, ignoring any query/`&`
 * suffix. Returns undefined for the default branch.
 */
function refOf(s) {
    const m = s.split("#")[1];
    if (!m)
        return undefined;
    return m.split(/[&?]/)[0] || undefined;
}
/**
 * Accepts whatever `dsh plugin add` forwards to pnpm:
 * github:owner/repo[#ref], https://github.com/…, owner/repo, dsh:…,
 * npm names, link:/path
 *
 * NOTE: the ref is retained (in `ref`) but NOT used as the lookup key — the
 * backend catalog is keyed at default-branch granularity. Callers must warn
 * when a non-default ref is requested, since trust data cannot attest a
 * specific pinned commit.
 */
export function parseInstallSpec(raw) {
    const text = String(raw || "").trim();
    if (!text)
        return { ok: false, raw, error: "empty spec" };
    if (/^link:/i.test(text) || text.startsWith(".") || text.startsWith("/")) {
        return { ok: true, raw: text, kind: "link", skipCheck: true };
    }
    if (/^dsh:/i.test(text)) {
        const rest = text.slice(4).replace(/^\/+|\/+$/g, "");
        const [owner, repo] = rest.split("/");
        return fromOwnerRepo(owner || "", repo || "", text, "github", refOf(rest));
    }
    if (/^github:/i.test(text)) {
        const rest = text.slice(7).replace(/^\/+|\/+$/g, "");
        const noHash = rest.split("#")[0].split("&")[0];
        const [owner, repo] = noHash.split("/");
        return fromOwnerRepo(owner || "", repo || "", text, "github", refOf(rest));
    }
    const gh = text.match(GH_URL);
    if (gh) {
        return fromOwnerRepo(gh[1], gh[2], text, "github", refOf(text));
    }
    if (OWNER_REPO.test(text)) {
        const [owner, repo] = text.split("/");
        return fromOwnerRepo(owner, repo, text, "github");
    }
    if (NPM_NAME.test(text)) {
        return { ok: true, raw: text, kind: "npm" };
    }
    return { ok: true, raw: text, kind: "unknown" };
}
/**
 * Find the install target after `add` in a `dsh plugin …` argv list.
 *
 * Robust against value-taking flags: any `--flag=value` is consumed inline,
 * and a known set of `--flag <value>` forms skip their value so it is not
 * mistaken for the install target.
 */
export function extractAddTarget(argv) {
    const VALUE_FLAGS = new Set([
        "--profile",
        "-p",
        "--filter",
        "--dir",
        "--prefix",
        "--tag",
        "-t",
        "--branch",
        "-b",
        "--registry",
        "--version",
        "-v",
        "--name",
        "--alias",
        "--range",
        "--channel",
        "--workspace",
        "--store-dir",
    ]);
    const addIdx = argv.findIndex((a) => a === "add");
    if (addIdx < 0)
        return null;
    for (let i = addIdx + 1; i < argv.length; i++) {
        const a = argv[i];
        if (!a.startsWith("-"))
            return a;
        if (a.includes("="))
            continue; // --key=value: value is inline
        if (VALUE_FLAGS.has(a)) {
            i += 1; // skip the value token
            continue;
        }
        // boolean / unknown flag: no value to skip
        continue;
    }
    return null;
}
//# sourceMappingURL=normalize.js.map