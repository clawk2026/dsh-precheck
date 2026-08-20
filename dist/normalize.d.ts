/** Parse dsh plugin install specs into owner/repo when possible. */
export type ParsedSpec = {
    ok: true;
    raw: string;
    kind: "github" | "npm" | "link" | "unknown";
    owner?: string;
    repo?: string;
    path?: string;
    ref?: string;
    dshSlug?: string;
    githubSlug?: string;
    skipCheck?: boolean;
} | {
    ok: false;
    raw: string;
    error: string;
};
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
export declare function parseInstallSpec(raw: string): ParsedSpec;
/**
 * Find the install target after `add` in a `dsh plugin …` argv list.
 *
 * Robust against value-taking flags: any `--flag=value` is consumed inline,
 * and a known set of `--flag <value>` forms skip their value so it is not
 * mistaken for the install target.
 */
export declare function extractAddTarget(argv: string[]): string | null;
