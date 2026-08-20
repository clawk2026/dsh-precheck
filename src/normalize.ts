/** Parse dsh plugin install specs into owner/repo when possible. */

export type ParsedSpec =
  | {
      ok: true;
      raw: string;
      kind: "github" | "npm" | "link" | "unknown";
      owner?: string;
      repo?: string;
      path?: string;
      dshSlug?: string;
      githubSlug?: string;
      skipCheck?: boolean;
    }
  | {
      ok: false;
      raw: string;
      error: string;
    };

const OWNER_REPO = /^[\w.-]+\/[\w.-]+$/;
const NPM_NAME = /^(@[\w.-]+\/)?[\w.-]+$/;
const GH_URL = /github\.com[/:]([^/\s?#]+)\/([^/\s?#]+)/i;

function fromOwnerRepo(owner: string, repo: string, raw: string, kind: "github"): ParsedSpec {
  const clean = repo.replace(/\.git$/i, "").replace(/\/+$/, "");
  if (!owner || !clean) {
    return { ok: false, raw, error: "expected owner/repo" };
  }
  return {
    ok: true,
    raw,
    kind,
    owner,
    repo: clean,
    path: `${owner}/${clean}`,
    dshSlug: `dsh:${owner}/${clean}`,
    githubSlug: `github:${owner}/${clean}`,
  };
}

/**
 * Accepts whatever `dsh plugin add` forwards to pnpm:
 * github:owner/repo[#ref], https://github.com/…, owner/repo, dsh:…,
 * npm names, link:/path
 */
export function parseInstallSpec(raw: string): ParsedSpec {
  const text = String(raw || "").trim();
  if (!text) return { ok: false, raw, error: "empty spec" };

  if (/^link:/i.test(text) || text.startsWith(".") || text.startsWith("/")) {
    return { ok: true, raw: text, kind: "link", skipCheck: true };
  }

  if (/^dsh:/i.test(text)) {
    const rest = text.slice(4).replace(/^\/+|\/+$/g, "");
    const [owner, repo] = rest.split("/");
    return fromOwnerRepo(owner || "", repo || "", text, "github");
  }

  if (/^github:/i.test(text)) {
    const rest = text.slice(7).replace(/^\/+|\/+$/g, "");
    const noHash = rest.split("#")[0].split("&")[0];
    const [owner, repo] = noHash.split("/");
    return fromOwnerRepo(owner || "", repo || "", text, "github");
  }

  const gh = text.match(GH_URL);
  if (gh) {
    return fromOwnerRepo(gh[1], gh[2], text, "github");
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

/** Find the install target after `add` in a `dsh plugin …` argv list. */
export function extractAddTarget(argv: string[]): string | null {
  const addIdx = argv.findIndex((a) => a === "add");
  if (addIdx < 0) return null;
  for (let i = addIdx + 1; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("-")) {
      // flags that take a value
      if (
        a === "--profile" ||
        a === "-p" ||
        a === "--filter" ||
        a === "--dir" ||
        a === "--prefix"
      ) {
        i += 1;
      }
      continue;
    }
    return a;
  }
  return null;
}
