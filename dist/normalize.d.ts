/** Parse dsh plugin install specs into owner/repo when possible. */
export type ParsedSpec = {
    ok: true;
    raw: string;
    kind: "github" | "npm" | "link" | "unknown";
    owner?: string;
    repo?: string;
    path?: string;
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
 */
export declare function parseInstallSpec(raw: string): ParsedSpec;
/** Find the install target after `add` in a `dsh plugin …` argv list. */
export declare function extractAddTarget(argv: string[]): string | null;
