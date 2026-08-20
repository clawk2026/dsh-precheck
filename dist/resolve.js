/** Remote grade resolution: FC /trust/resolve first, then catalog_dsh.json. */
import { DEFAULT_FC_QUERY_URL, RETRY_HINT_SHORT, SITE } from "./constants.js";
import { parseInstallSpec } from "./normalize.js";
function catalogUrl() {
    return (process.env.DSH_PRECHECK_CATALOG_URL ||
        process.env.DSH_GUARD_CATALOG_URL ||
        "https://zhuangqiancha-web.oss-cn-hangzhou.aliyuncs.com/catalog_dsh.json");
}
function siteBase() {
    return (process.env.DSH_PRECHECK_URL || SITE).replace(/\/$/, "");
}
function fcBase() {
    return (process.env.ZQC_FC_QUERY_URL ||
        process.env.DSH_PRECHECK_RESOLVE_URL ||
        process.env.DSH_GUARD_RESOLVE_URL ||
        DEFAULT_FC_QUERY_URL).replace(/\/$/, "");
}
export function detailUrlFor(path) {
    if (!path)
        return undefined;
    const [owner, repo] = path.split("/");
    if (!owner || !repo)
        return undefined;
    return `${siteBase()}/plugin/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}
function asGrade(g) {
    const s = String(g || "unknown").toLowerCase();
    if (s === "green" || s === "yellow" || s === "orange" || s === "red")
        return s;
    return "unknown";
}
async function fetchJson(url, timeoutMs = 15000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            signal: ctrl.signal,
            headers: { Accept: "application/json", "User-Agent": "dsh-precheck/0.1" },
        });
        let json = null;
        try {
            json = await res.json();
        }
        catch {
            json = null;
        }
        return { ok: res.ok, status: res.status, json };
    }
    finally {
        clearTimeout(t);
    }
}
async function resolveViaFc(urlOrPath) {
    const base = fcBase();
    if (!base)
        return null;
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
            const path = json.requested?.path || String(json.tool?.slug || "").replace(/^dsh:/i, "");
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
    }
    catch {
        return null;
    }
}
async function resolveViaTrust(slug, path) {
    const base = fcBase();
    if (!base)
        return null;
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
    }
    catch {
        return null;
    }
}
let catalogCache = null;
async function loadCatalog() {
    const now = Date.now();
    if (catalogCache && now - catalogCache.at < 10 * 60 * 1000)
        return catalogCache.index;
    const { ok, json } = await fetchJson(catalogUrl(), 25000);
    if (!ok || !Array.isArray(json?.cols) || !Array.isArray(json?.rows)) {
        throw new Error("catalog_unavailable");
    }
    const cols = json.cols;
    const index = new Map();
    for (const row of json.rows) {
        const o = {};
        for (let i = 0; i < cols.length; i++)
            o[cols[i]] = row[i] ?? null;
        if (o.slug)
            index.set(String(o.slug).toLowerCase(), o);
    }
    catalogCache = { at: now, index };
    return index;
}
async function resolveViaCatalog(slug, path) {
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
    }
    catch (err) {
        return {
            status: "error",
            grade: "unknown",
            slug,
            message: err?.message || "catalog fetch failed",
            source: "catalog",
        };
    }
}
async function npmToGithubPath(pkg) {
    try {
        const enc = pkg.startsWith("@") ? pkg.replace("/", "%2F") : encodeURIComponent(pkg);
        const { ok, json } = await fetchJson(`https://registry.npmjs.org/${enc}`);
        if (!ok || !json)
            return null;
        const latest = json["dist-tags"]?.latest;
        const meta = (latest && json.versions?.[latest]) || json;
        const repo = meta?.repository?.url || meta?.repository || json.repository?.url || json.repository;
        const text = typeof repo === "string" ? repo : "";
        const m = text.match(/github\.com[/:]([^/\s?#]+)\/([^/\s?#]+)/i);
        if (!m)
            return null;
        return `${m[1]}/${m[2].replace(/\.git$/i, "")}`;
    }
    catch {
        return null;
    }
}
export async function resolveSpec(raw) {
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
        }
        else {
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
    const tag = (r) => {
        if (parsed.ref)
            r.requestedRef = parsed.ref;
        return r;
    };
    const lookupKey = path || parsed.raw;
    const resolveUrl = lookupKey.includes("github.com")
        ? lookupKey
        : `https://github.com/${lookupKey}`;
    const viaResolve = await resolveViaFc(resolveUrl);
    if (viaResolve && viaResolve.status !== "error")
        return tag(viaResolve);
    if (dshSlug) {
        const a = await resolveViaTrust(dshSlug, path);
        if (a && a.status !== "error")
            return tag(a);
    }
    if (githubSlug) {
        const b = await resolveViaTrust(githubSlug, path);
        if (b && b.status !== "error")
            return tag(b);
    }
    if (dshSlug)
        return tag(await resolveViaCatalog(dshSlug, path));
    return tag({
        status: "missing",
        grade: "unknown",
        message: `Unable to resolve plugin reference. ${RETRY_HINT_SHORT}`,
    });
}
//# sourceMappingURL=resolve.js.map