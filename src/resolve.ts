/** Remote grade resolution: FC /trust/resolve first, then catalog_dsh.json. */

import { DEFAULT_FC_QUERY_URL, RETRY_HINT_SHORT, SITE, VERSION } from "./constants.js";
import { parseInstallSpec, type ParsedSpec } from "./normalize.js";

export type Grade = "green" | "yellow" | "orange" | "red" | "unknown";

export type ResolveResult = {
  status: "ok" | "scanning" | "missing" | "error" | "skipped";
  grade: Grade;
  slug?: string;
  name?: string;
  findingCount?: number;
  message?: string;
  detailUrl?: string;
  source?: "resolve" | "trust" | "catalog" | "local";
  /** Ref requested by the user (e.g. github:owner/repo#v2). Included so
   *  callers can warn that trust data covers the default branch only. */
  requestedRef?: string;
  /** Client-side hard error (e.g. malformed spec): do not pass through to
   *  the installer even in advisory mode. */
  terminal?: boolean;
};

// Catalog is served through the Cloudflare Worker (s.dshprecheck.com) which
// proxies the OSS bucket, so the bucket's public origin never appears in this
// repo. Override with DSH_PRECHECK_CATALOG_URL / DSH_GUARD_CATALOG_URL.
function catalogUrl(): string {
  return (
    process.env.DSH_PRECHECK_CATALOG_URL ||
    process.env.DSH_GUARD_CATALOG_URL ||
    "https://s.dshprecheck.com/catalog_dsh.json"
  );
}

function siteBase(): string {
  return (process.env.DSH_PRECHECK_URL || SITE).replace(/\/$/, "");
}

function fcBase(): string {
  return (
    process.env.ZQC_FC_QUERY_URL ||
    process.env.DSH_PRECHECK_RESOLVE_URL ||
    process.env.DSH_GUARD_RESOLVE_URL ||
    DEFAULT_FC_QUERY_URL
  ).replace(/\/$/, "");
}

export function detailUrlFor(path?: string): string | undefined {
  if (!path) return undefined;
  const [owner, repo] = path.split("/");
  if (!owner || !repo) return undefined;
  return `${siteBase()}/plugin/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

function asGrade(g: unknown): Grade {
  const s = String(g || "unknown").toLowerCase();
  if (s === "green" || s === "yellow" || s === "orange" || s === "red") return s;
  return "unknown";
}

async function fetchJson(
  url: string,
  timeoutMs = 15000
): Promise<{ ok: boolean; status: number; json: any }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json", "User-Agent": `dsh-precheck/${VERSION}` },
    });
    let json: any = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }
    return { ok: res.ok, status: res.status, json };
  } finally {
    clearTimeout(t);
  }
}

async function resolveViaFc(urlOrPath: string): Promise<ResolveResult | null> {
  const base = fcBase();
  if (!base) return null;
  const endpoint = `${base}/trust/resolve?url=${encodeURIComponent(urlOrPath)}`;
  try {
    const { status, json } = await fetchJson(endpoint);
    if (status === 202) {
      return {
        status: "scanning",
        grade: "unknown",
        slug: json?.slug,
        message: json?.message
          ? `${json.message} ${RETRY_HINT_SHORT}`
          : `Queued for assessment. ${RETRY_HINT_SHORT}`,
        source: "resolve",
        detailUrl: detailUrlFor(json?.requested?.path),
      };
    }
    if (status === 200 && json) {
      const grade = asGrade(json.grade ?? json.tool?.current_grade);
      const path =
        json.requested?.path || String(json.tool?.slug || "").replace(/^dsh:/i, "");
      return {
        status: "ok",
        grade,
        slug: json.tool?.slug || json.resolved_from,
        name: json.tool?.name,
        findingCount: Array.isArray(json.findings) ? json.findings.length : undefined,
        source: "resolve",
        detailUrl: detailUrlFor(path),
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function resolveViaTrust(slug: string, path?: string): Promise<ResolveResult | null> {
  const base = fcBase();
  if (!base) return null;
  try {
    const { status, json } = await fetchJson(`${base}/trust/${encodeURIComponent(slug)}`);
    if (status === 202) {
      return {
        status: "scanning",
        grade: "unknown",
        slug,
        message: `Queued for assessment. ${RETRY_HINT_SHORT}`,
        source: "trust",
        detailUrl: detailUrlFor(path),
      };
    }
    if (status === 200 && json) {
      return {
        status: "ok",
        grade: asGrade(json.grade ?? json.tool?.current_grade),
        slug: json.tool?.slug || slug,
        name: json.tool?.name,
        findingCount: Array.isArray(json.findings) ? json.findings.length : undefined,
        source: "trust",
        detailUrl: detailUrlFor(path),
      };
    }
    return null;
  } catch {
    return null;
  }
}

let catalogCache: { at: number; index: Map<string, any> } | null = null;

async function loadCatalog(): Promise<Map<string, any>> {
  const now = Date.now();
  if (catalogCache && now - catalogCache.at < 10 * 60 * 1000) return catalogCache.index;
  const { ok, json } = await fetchJson(catalogUrl(), 25000);
  if (!ok || !Array.isArray(json?.cols) || !Array.isArray(json?.rows)) {
    throw new Error("catalog_unavailable");
  }
  const cols: string[] = json.cols;
  const index = new Map<string, any>();
  for (const row of json.rows) {
    const o: any = {};
    for (let i = 0; i < cols.length; i++) o[cols[i]] = row[i] ?? null;
    if (o.slug) index.set(String(o.slug).toLowerCase(), o);
  }
  catalogCache = { at: now, index };
  return index;
}

async function resolveViaCatalog(slug: string, path?: string): Promise<ResolveResult> {
  try {
    const index = await loadCatalog();
    const hit = index.get(slug.toLowerCase());
    if (!hit) {
      return {
        status: "missing",
        grade: "unknown",
        slug,
        message: `Not in catalog yet. ${RETRY_HINT_SHORT}`,
        detailUrl: detailUrlFor(path),
        source: "catalog",
      };
    }
    return {
      status: "ok",
      grade: asGrade(hit.grade),
      slug: hit.slug,
      name: hit.name,
      findingCount: Number(hit.finding_count || 0),
      detailUrl: detailUrlFor(path || String(hit.slug).replace(/^dsh:/i, "")),
      source: "catalog",
    };
  } catch (err: any) {
    return {
      status: "error",
      grade: "unknown",
      slug,
      message: err?.message || "catalog fetch failed",
      source: "catalog",
    };
  }
}

async function npmToGithubPath(pkg: string): Promise<string | null> {
  try {
    const enc = pkg.startsWith("@") ? pkg.replace("/", "%2F") : encodeURIComponent(pkg);
    const { ok, json } = await fetchJson(`https://registry.npmjs.org/${enc}`);
    if (!ok || !json) return null;
    const latest = json["dist-tags"]?.latest;
    const meta = (latest && json.versions?.[latest]) || json;
    const repo =
      meta?.repository?.url || meta?.repository || json.repository?.url || json.repository;
    const text = typeof repo === "string" ? repo : "";
    const m = text.match(/github\.com[/:]([^/\s?#]+)\/([^/\s?#]+)/i);
    if (!m) return null;
    return `${m[1]}/${m[2].replace(/\.git$/i, "")}`;
  } catch {
    return null;
  }
}

export async function resolveSpec(raw: string): Promise<ResolveResult> {
  const parsed = parseInstallSpec(raw);
  if (!parsed.ok) {
    return {
      status: "error",
      grade: "unknown",
      message: parsed.error,
      terminal: true,
    };
  }
  if (parsed.skipCheck) {
    return {
      status: "skipped",
      grade: "unknown",
      message: "Local link — check skipped",
      source: "local",
    };
  }

  let path = parsed.path;
  let dshSlug = parsed.dshSlug;
  let githubSlug = parsed.githubSlug;

  if (parsed.kind === "npm" && !path) {
    const ghPath = await npmToGithubPath(parsed.raw);
    if (ghPath) {
      path = ghPath;
      dshSlug = `dsh:${ghPath}`;
      githubSlug = `github:${ghPath}`;
    } else {
      return {
        status: "missing",
        grade: "unknown",
        message: `Cannot map npm package ${parsed.raw} to a GitHub repo`,
      };
    }
  }

  if (parsed.kind === "unknown") {
    return {
      status: "error",
      grade: "unknown",
      message: `Unrecognized install spec: ${parsed.raw}`,
    };
  }

  // Attach the requested ref (if any) so callers can warn that trust data
  // covers the default branch only and cannot attest a pinned commit.
  const tag = (r: ResolveResult): ResolveResult => {
    if (parsed.ref) r.requestedRef = parsed.ref;
    return r;
  };

  const lookupKey = path || parsed.raw;
  const resolveUrl = lookupKey.includes("github.com")
    ? lookupKey
    : `https://github.com/${lookupKey}`;

  const viaResolve = await resolveViaFc(resolveUrl);
  if (viaResolve && viaResolve.status !== "error") return tag(viaResolve);

  if (dshSlug) {
    const a = await resolveViaTrust(dshSlug, path);
    if (a && a.status !== "error") return tag(a);
  }
  if (githubSlug) {
    const b = await resolveViaTrust(githubSlug, path);
    if (b && b.status !== "error") return tag(b);
  }

  if (dshSlug) return tag(await resolveViaCatalog(dshSlug, path));

  return tag({
    status: "missing",
    grade: "unknown",
    message: `Unable to resolve plugin reference. ${RETRY_HINT_SHORT}`,
  });
}

export type { ParsedSpec };
