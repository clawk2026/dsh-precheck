/**
 * DSH Precheck — Security & Trust Checks for DeepSeek Harness Plugins
 * Path-based SPA + English-only UI (CJK from upstream data is filtered).
 */

const SITE = "https://dshprecheck.com";
const PAGE_SIZE = 24;
const CJK_RE = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;

const GRADE_META = {
  green: { label: "Clear", color: "#22c55e", shape: "check" },
  yellow: { label: "Watch", color: "#eab308", shape: "search" },
  orange: { label: "Caution", color: "#f97316", shape: "info" },
  red: { label: "High risk", color: "#ef4444", shape: "bolt" },
  unknown: { label: "Pending", color: "#94a3b8", shape: "question" },
};

const GRADE_DEF = {
  green: "No clear risk signals under current rules. Fine to consider with normal caution.",
  yellow: "Signals are mild; review before relying on it.",
  orange: "Risk behaviors were found. Read the evidence before installing.",
  red: "High-risk evidence was found. Verify permissions and data flows before install.",
  unknown: "Not enough evidence yet, or assessment is still in progress.",
};

const SEV = {
  P0: { label: "P0 Critical", cls: "sev-p0" },
  P1: { label: "P1 Risk", cls: "sev-p1" },
  P2: { label: "P2 Note", cls: "sev-p2" },
};

const CATEGORY_EN = {
  "\u786e\u5b9a\u6027\u5371\u9669": "Deterministic risk",
  "\u98ce\u9669\u884c\u4e3a": "Risky behavior",
  "\u900f\u660e\u5ea6\u95ee\u9898": "Transparency",
  "\u5f85\u5b9a": "Undetermined",
};

const RULE_TITLE = [
  ["R1_", "Hardcoded secrets"],
  ["R2_", "Destructive commands"],
  ["R3_", "Remote code execution"],
  ["R4_", "Sensitive file exfiltration"],
  ["R5_", "External data exfiltration"],
  ["R6_", "Prompt injection"],
  ["R7_", "Obfuscated execution"],
  ["R8_", "Suspicious egress"],
  ["R9_", "Credential / env leakage"],
  ["R13_", "Packed or obfuscated payload"],
  ["R14_", "Network listen / bind"],
  ["R16_", "Local shell execution"],
  ["LLM_", "Model-assisted review finding"],
];

const app = document.getElementById("app");
/** @type {Map<string, object> | null} */
let catalogIndex = null;
/** @type {object[] | null} */
let catalogRows = null;
/** @type {object[] | null} */
let sortedPlugins = null;
let listOffset = 0;
let listLoading = false;
/** @type {IntersectionObserver | null} */
let sentinelObserver = null;

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** True if string contains CJK ideographs (upstream catalogs may be zh). */
function hasCjk(s) {
  return CJK_RE.test(String(s || ""));
}

/**
 * Prefer English display text. Drop CJK / mixed-CJK upstream strings.
 */
function enText(...candidates) {
  for (const c of candidates) {
    const t = String(c ?? "").trim();
    if (!t) continue;
    if (hasCjk(t)) continue;
    return t;
  }
  return "";
}

function categoryEn(c) {
  const s = String(c || "");
  if (CATEGORY_EN[s]) return CATEGORY_EN[s];
  return enText(s) || "Uncategorized";
}

function findingTitle(f) {
  const fromData = enText(f?.title);
  if (fromData) return fromData;
  const id = String(f?.rule_id || "");
  for (const [prefix, title] of RULE_TITLE) {
    if (id.startsWith(prefix)) return title;
  }
  return id || "Finding";
}

function findingBody(f) {
  return (
    enText(f?.detail, f?.message, f?.evidence) ||
    "Evidence located in the scanned plugin snapshot."
  );
}

function toolBlurb(tool, grade) {
  return (
    enText(tool?.summary, tool?.description) ||
    GRADE_DEF[grade] ||
    GRADE_DEF.unknown
  );
}

function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function toolShard(slug) {
  return String(fnv1a(slug) % 256).padStart(3, "0");
}

function gradeMeta(g) {
  return GRADE_META[g] || GRADE_META.unknown;
}

function shapeSvg(shape, color, size = 14) {
  if (shape === "check") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="${color}"/><path d="M7 12.4l3 3 7-7" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  if (shape === "info") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="${color}"/><rect x="11" y="10.5" width="2" height="6" rx="1" fill="#fff"/><circle cx="12" cy="7.6" r="1.15" fill="#fff"/></svg>`;
  }
  if (shape === "bolt") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="${color}"/><path d="M13 3 L5 13 L11 13 L10 21 L19 11 L13 11 Z" fill="#fff"/></svg>`;
  }
  if (shape === "search") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="${color}"/><circle cx="10.5" cy="10.5" r="4" fill="none" stroke="#fff" stroke-width="2"/><line x1="13.4" y1="13.4" x2="17.6" y2="17.6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="${color}"/><text x="12" y="16.5" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="system-ui">?</text></svg>`;
}

function renderBadge(grade) {
  const m = gradeMeta(grade);
  return `<span class="badge" style="color:${m.color};border-color:${m.color}33;background:${m.color}14;box-shadow:0 0 12px -3px ${m.color}66">${shapeSvg(m.shape, m.color)}${esc(m.label)}</span>`;
}

function starsOf(tool) {
  const n = tool.install_count ?? tool.stars ?? tool.downloads;
  return typeof n === "number" && n > 0 ? n : null;
}

function normalizeRef(raw) {
  const text = String(raw || "").trim();
  if (!text) return { ok: false, error: "Enter a GitHub URL or owner/repo" };

  if (/^dsh:/i.test(text)) {
    const rest = text.slice(4).replace(/^\/+|\/+$/g, "");
    if (!/^[\w.-]+\/[\w.-]+$/.test(rest)) {
      return { ok: false, error: "After dsh: use owner/repo" };
    }
    return { ok: true, slug: `dsh:${rest}`, path: rest };
  }

  let path = text;
  const gh = text.match(/github\.com[/:]([^/\s]+)\/([^/\s?#]+)/i);
  if (gh) {
    path = `${gh[1]}/${gh[2]}`;
  } else if (!/^[\w.-]+\/[\w.-]+$/.test(text)) {
    return { ok: false, error: "Unrecognized. Use https://github.com/owner/repo or owner/repo" };
  }

  path = path.replace(/\.git$/i, "").replace(/\/+$/, "");
  const parts = path.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { ok: false, error: "Repo path must be owner/repo" };
  }
  return { ok: true, slug: `dsh:${parts[0]}/${parts[1]}`, path: `${parts[0]}/${parts[1]}` };
}

function githubUrl(path) {
  return `https://github.com/${path}`;
}

function pluginPath(slugOrPath) {
  const path = String(slugOrPath || "").replace(/^dsh:/i, "");
  const [owner, repo] = path.split("/");
  if (!owner || !repo) return "/";
  return `/plugin/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

function slugFromPluginParts(owner, repo) {
  return `dsh:${decodeURIComponent(owner)}/${decodeURIComponent(repo)}`;
}

function absoluteUrl(path) {
  return SITE + (path.startsWith("/") ? path : `/${path}`);
}

function setMeta(name, content, attr = "name") {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setSeo({ title, description, path, type = "website", jsonLd = null }) {
  const fullTitle = title;
  const url = absoluteUrl(path || "/");
  document.title = fullTitle;
  setMeta("description", description);
  setMeta("og:title", fullTitle, "property");
  setMeta("og:description", description, "property");
  setMeta("og:url", url, "property");
  setMeta("og:type", type, "property");
  setMeta("twitter:title", fullTitle);
  setMeta("twitter:description", description);

  const canon = document.getElementById("meta-canonical");
  if (canon) canon.setAttribute("href", url);

  // Remove previous page JSON-LD blocks
  document.querySelectorAll("script[data-seo-jsonld]").forEach((n) => n.remove());
  const items = jsonLd == null ? [] : Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  for (const item of items) {
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.setAttribute("data-seo-jsonld", "1");
    ld.textContent = JSON.stringify(item);
    document.head.appendChild(ld);
  }
}

async function loadCatalog() {
  if (catalogIndex) return catalogIndex;
  const res = await fetch("/api/catalog", { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Catalog load failed (${res.status})`);
  const doc = await res.json();
  if (!Array.isArray(doc?.cols) || !Array.isArray(doc?.rows)) {
    throw new Error("Unexpected catalog format");
  }
  const cols = doc.cols;
  const rows = doc.rows.map((row) => {
    const o = {};
    for (let i = 0; i < cols.length; i++) o[cols[i]] = row[i] ?? null;
    return o;
  });
  catalogRows = rows;
  sortedPlugins = [...rows].sort((a, b) => (starsOf(b) || 0) - (starsOf(a) || 0));
  catalogIndex = new Map(rows.map((t) => [String(t.slug || "").toLowerCase(), t]));
  return catalogIndex;
}

async function loadToolDetail(slug) {
  const sh = toolShard(slug);
  const res = await fetch(`/api/shard/${sh}`, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const data = await res.json();
  const tool = data?.tools?.[slug];
  if (!tool) return null;
  return {
    tool,
    findings: data.findings?.[slug] ?? [],
  };
}

function setNav(active) {
  document.querySelectorAll(".nav-link").forEach((el) => {
    el.classList.toggle("is-active", el.getAttribute("data-nav") === active);
  });
}

function toolCardHtml(tool) {
  const grade = tool.grade || "unknown";
  const meta = gradeMeta(grade);
  const stars = starsOf(tool);
  const findings = Number(tool.finding_count || 0);
  const path = String(tool.slug || "").replace(/^dsh:/i, "");
  const name = enText(tool.name) || path;
  const summary = toolBlurb(tool, grade);

  return `
    <a class="tool-card" href="${pluginPath(tool.slug)}" data-slug="${esc(tool.slug)}" data-link style="border-left-color:${meta.color}">
      <div class="tool-card-top">
        <div style="min-width:0">
          <h3 class="tool-card-name">${esc(name)}</h3>
          <p class="tool-card-meta">${esc(enText(tool.category) || "plugin")} · DSH</p>
        </div>
        ${renderBadge(grade)}
      </div>
      <p class="tool-card-summary">${esc(summary)}</p>
      <div class="tool-card-foot">
        <span>${esc(enText(tool.author) || "unknown")}</span>
        ${findings > 0 ? `<span class="finding-pill">${findings} evidence</span>` : ""}
        ${stars != null ? `<span class="stars">★ ${stars.toLocaleString()}</span>` : ""}
      </div>
    </a>
  `;
}

function disconnectSentinel() {
  if (sentinelObserver) {
    sentinelObserver.disconnect();
    sentinelObserver = null;
  }
}

function appendPluginPage() {
  const grid = document.getElementById("hot-grid");
  const count = document.getElementById("hot-count");
  const sentinel = document.getElementById("list-sentinel");
  if (!grid || !sortedPlugins) return;
  if (listLoading) return;
  if (listOffset >= sortedPlugins.length) {
    if (sentinel) sentinel.hidden = true;
    return;
  }

  listLoading = true;
  const slice = sortedPlugins.slice(listOffset, listOffset + PAGE_SIZE);
  listOffset += slice.length;
  const wrap = document.createElement("div");
  wrap.innerHTML = slice.map(toolCardHtml).join("");
  while (wrap.firstChild) grid.appendChild(wrap.firstChild);

  if (count) {
    count.textContent = `Showing ${Math.min(listOffset, sortedPlugins.length).toLocaleString()} of ${sortedPlugins.length.toLocaleString()}`;
  }
  if (sentinel) {
    sentinel.hidden = listOffset >= sortedPlugins.length;
    const tip = document.getElementById("list-tip");
    if (tip) {
      tip.textContent =
        listOffset >= sortedPlugins.length ? "End of list" : "Scroll for more";
    }
  }
  listLoading = false;
}

function setupInfiniteScroll() {
  disconnectSentinel();
  const sentinel = document.getElementById("list-sentinel");
  if (!sentinel) return;
  sentinelObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) appendPluginPage();
    },
    { rootMargin: "400px 0px" }
  );
  sentinelObserver.observe(sentinel);
}

function renderHome(opts = {}) {
  setNav("home");
  disconnectSentinel();
  listOffset = 0;
  listLoading = false;
  const q = opts.q || "";

  setSeo({
    title: "DSH Precheck — Security & Trust Checks for DeepSeek Harness Plugins",
    description:
      "Know what a DSH plugin can access before you give it control of your agent. Check before you install.",
    path: q ? `/?q=${encodeURIComponent(q)}` : "/",
    type: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "DSH Precheck",
      url: SITE + "/",
      description: "Security & Trust Checks for DeepSeek Harness Plugins",
      potentialAction: {
        "@type": "SearchAction",
        target: SITE + "/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  });

  app.innerHTML = `
    <section class="hero">
      <p class="hero-kicker">Security &amp; Trust Checks for DeepSeek Harness Plugins</p>
      <h1 class="hero-title">Check before you install.</h1>
      <p class="hero-lead">Know what a DSH plugin can access before you give it control of your agent.</p>
      <form class="lookup" id="lookup-form" autocomplete="off" role="search">
        <label class="sr-only" for="url-input">GitHub URL</label>
        <input id="url-input" name="url" type="text" spellcheck="false"
          placeholder="https://github.com/owner/repo" enterkeyhint="search" value="${esc(q)}" />
        <button type="submit" id="lookup-btn">Lookup</button>
      </form>
      <p class="hint">Accepts full URL, owner/repo, or dsh:owner/repo</p>
    </section>
    <div id="lookup-result"></div>
    <div class="section-head">
      <h2>DSH plugins</h2>
      <p id="hot-count">Loading…</p>
    </div>
    <div class="card-grid" id="hot-grid"></div>
    <div id="list-sentinel" class="list-sentinel" hidden>
      <p id="list-tip" class="muted">Scroll for more</p>
    </div>
  `;

  const form = document.getElementById("lookup-form");
  const input = document.getElementById("url-input");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    doLookup(input.value);
  });

  loadCatalog()
    .then(() => {
      const grid = document.getElementById("hot-grid");
      if (!grid) return;
      if (!sortedPlugins?.length) {
        grid.innerHTML = `<p class="muted">No plugins yet</p>`;
        return;
      }
      appendPluginPage();
      setupInfiniteScroll();
      if (q) doLookup(q);
    })
    .catch((err) => {
      const grid = document.getElementById("hot-grid");
      if (grid) {
        grid.innerHTML = `<p class="muted">${esc(err?.message || "Failed to load catalog")}</p>`;
      }
    });
}

async function doLookup(raw) {
  const resultEl = document.getElementById("lookup-result");
  const btn = document.getElementById("lookup-btn");
  if (!resultEl) return;

  const parsed = normalizeRef(raw);
  if (!parsed.ok) {
    resultEl.innerHTML = `<div class="state-msg"><strong>Invalid input</strong><p style="margin:0.5rem 0 0">${esc(parsed.error)}</p></div>`;
    return;
  }

  if (btn) btn.disabled = true;
  resultEl.innerHTML = `<div class="state-msg">Looking up catalog…</div>`;

  try {
    await loadCatalog();
    const tool = catalogIndex.get(parsed.slug.toLowerCase());
    const url = new URL(window.location.href);
    url.searchParams.set("q", parsed.path);
    history.replaceState(null, "", `${url.pathname}${url.search}`);

    if (!tool) {
      // Not in catalog → ask FC to queue (async). User retries later; no live wait.
      let queued = false;
      let queueMsg = "";
      try {
        const res = await fetch(`/api/resolve?url=${encodeURIComponent(parsed.path)}`, {
          headers: { Accept: "application/json" },
        });
        if (res.status === 202) {
          queued = true;
          const j = await res.json().catch(() => ({}));
          queueMsg = j.message || "";
        } else if (res.status === 200) {
          // FC already has it (catalog lag) — soft-reload catalog once
          catalogIndex = null;
          catalogRows = null;
          sortedPlugins = null;
          await loadCatalog();
          const again = catalogIndex.get(parsed.slug.toLowerCase());
          if (again) {
            resultEl.innerHTML = `
              <div class="section-head" style="margin-top:1.25rem">
                <h2>Match</h2>
                <p>${esc(parsed.slug)}</p>
              </div>
              <div class="card-grid" style="grid-template-columns:1fr;max-width:28rem">${toolCardHtml(again)}</div>
              <div class="actions">
                <a class="btn btn-primary" href="${pluginPath(again.slug)}" data-link>Open detail</a>
                <a class="btn btn-ghost" href="${githubUrl(parsed.path)}" target="_blank" rel="noopener">GitHub</a>
              </div>`;
            return;
          }
        } else if (res.status === 503) {
          queueMsg = "Queueing is not configured on this deployment yet.";
        }
      } catch {
        /* ignore — still show missing UI */
      }

      resultEl.innerHTML = `
        <div class="state-msg">
          <strong>${queued ? "Queued for assessment" : "Not in catalog yet"}</strong>
          <p style="margin:0.5rem 0 0">
            <code>${esc(parsed.slug)}</code>
            ${
              queued
                ? " has been added to the scan queue. Assessment is <strong>not instant</strong> — the pipeline usually runs about every <strong>3 hours</strong>. Please check back in a few hours (up to ~3 hours), then tap Try again."
                : " is not indexed yet."
            }
            ${queueMsg ? ` ${esc(queueMsg)}` : ""}
          </p>
          <div class="actions">
            <button type="button" class="btn btn-primary" id="retry-lookup">Try again</button>
            <a class="btn btn-ghost" href="${githubUrl(parsed.path)}" target="_blank" rel="noopener">GitHub</a>
          </div>
        </div>`;
      document.getElementById("retry-lookup")?.addEventListener("click", () => {
        catalogIndex = null;
        catalogRows = null;
        sortedPlugins = null;
        doLookup(parsed.path);
      });
      return;
    }

    resultEl.innerHTML = `
      <div class="section-head" style="margin-top:1.25rem">
        <h2>Match</h2>
        <p>${esc(parsed.slug)}</p>
      </div>
      <div class="card-grid" style="grid-template-columns:1fr;max-width:28rem">${toolCardHtml(tool)}</div>
      <div class="actions">
        <a class="btn btn-primary" href="${pluginPath(tool.slug)}" data-link>Open detail</a>
        <a class="btn btn-ghost" href="${githubUrl(parsed.path)}" target="_blank" rel="noopener">GitHub</a>
      </div>`;
  } catch (err) {
    resultEl.innerHTML = `<div class="state-msg"><strong>Lookup failed</strong><p style="margin:0.5rem 0 0">${esc(err?.message || "Network error")}</p></div>`;
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function renderTool(owner, repo) {
  setNav("home");
  disconnectSentinel();
  const slug = slugFromPluginParts(owner, repo);
  const path = `${decodeURIComponent(owner)}/${decodeURIComponent(repo)}`;
  const pagePath = pluginPath(slug);

  app.innerHTML = `<div class="state-msg">Loading detail…</div>`;
  setSeo({
    title: `Is ${path} safe? — DSH Precheck`,
    description: `Is ${path} safe to install? Check the DSH plugin risk grade and evidence before you give it control of your agent.`,
    path: pagePath,
    type: "article",
  });

  let light = null;
  try {
    await loadCatalog();
    light = catalogIndex.get(slug.toLowerCase()) || null;
  } catch {
    /* optional */
  }

  let detail = null;
  try {
    detail = await loadToolDetail(slug);
  } catch {
    detail = null;
  }

  const tool = detail?.tool || light;
  if (!tool) {
    let queued = false;
    try {
      const res = await fetch(`/api/resolve?url=${encodeURIComponent(path)}`, {
        headers: { Accept: "application/json" },
      });
      queued = res.status === 202;
    } catch {
      /* ignore */
    }
    setSeo({
      title: `Is ${path} safe? — ${queued ? "Queued" : "Not found"} | DSH Precheck`,
      description: queued
        ? `${path} was queued for assessment. Check back in a few hours (pipeline ~every 3 hours).`
        : `We could not find DSH plugin ${path} in the catalog yet.`,
      path: pagePath,
    });
    app.innerHTML = `
      <nav class="crumb"><a href="/" data-link>Home</a><span>/</span><span>Not found</span></nav>
      <div class="state-msg">
        <strong>${queued ? "Queued for assessment" : "Tool not found"}</strong>
        <p style="margin:0.5rem 0 0"><code>${esc(slug)}</code>
          ${
            queued
              ? " has been added to the scan queue. This is <strong>not instant</strong> — results usually appear within a few hours (scheduled pipeline about every <strong>3 hours</strong>). Then tap Try again."
              : " is missing from the catalog and shard data."
          }
        </p>
        <div class="actions">
          <button type="button" class="btn btn-primary" id="retry-detail">Try again</button>
          <a class="btn btn-ghost" href="/" data-link>Back home</a>
        </div>
      </div>`;
    document.getElementById("retry-detail")?.addEventListener("click", () => {
      catalogIndex = null;
      renderTool(owner, repo);
    });
    return;
  }

  const findings = detail?.findings || [];
  const grade = tool.grade || "unknown";
  const meta = gradeMeta(grade);
  const name = enText(tool.name) || path;
  const stars = starsOf(tool);
  const author = enText(tool.author);
  const authorReds = tool.author_reds ?? 0;
  const authorTools = tool.author_tools;
  const blurb = toolBlurb(tool, grade);
  const gradeNote = GRADE_DEF[grade] || GRADE_DEF.unknown;
  const transparency = findings.filter((f) => {
    const c = String(f.category || "");
    return /transparenc/i.test(c) || c === "\u900f\u660e\u5ea6\u95ee\u9898";
  }).length;
  const privacy = findings.filter((f) =>
    ["R4_sensitive_file_exfil", "R5_external_exfil", "R8_suspicious_egress", "R9_env_credential_send"].includes(f.rule_id)
  ).length;

  const p0 = findings.filter((f) => f.severity === "P0").length;
  const riskAnswer =
    findings.length === 0
      ? `${name} is currently graded “${meta.label}”: ${gradeNote}`
      : `${name} is graded “${meta.label}” with ${findings.length} evidence item(s)${p0 ? `, including ${p0} critical (P0)` : ""}. ${gradeNote}`;

  setSeo({
    title: `Is ${name} safe? — DSH Precheck`,
    description: `Is ${name} safe? ${riskAnswer} Check before you install this DeepSeek Harness plugin.`,
    path: pagePath,
    type: "article",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Agent / DeepSeek Harness",
        description: blurb,
        url: absoluteUrl(pagePath),
        ...(author ? { author: { "@type": "Person", name: author } } : {}),
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@type": "Organization", name: "DSH Precheck", url: SITE + "/" },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Is ${name} safe?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: riskAnswer,
            },
          },
          {
            "@type": "Question",
            name: `What risks does ${name} have?`,
            acceptedAnswer: {
              "@type": "Answer",
              text:
                findings.length === 0
                  ? `No clear risk evidence is listed yet for ${name}.`
                  : `${name} has ${findings.length} evidence item(s) in the current scan (${p0} critical). Review the evidence on this page before installing.`,
            },
          },
        ],
      },
    ],
  });

  const layers = [
    {
      title: "Risk grade",
      value: meta.label,
      note: GRADE_DEF[grade] || GRADE_DEF.unknown,
      color: meta.color,
    },
    {
      title: "Permission clarity",
      value: transparency === 0 ? "Clear" : `${transparency} to review`,
      note:
        transparency === 0
          ? "Permissions look consistent with declarations."
          : "Some permissions or author details may be under-documented.",
      color: transparency === 0 ? "#22c55e" : "#eab308",
    },
    {
      title: "Data destinations",
      value: privacy > 0 ? `${privacy} signal(s)` : "No exfil signals",
      note:
        privacy > 0
          ? "Possible outbound data behaviors were detected."
          : "No clear data-exfiltration behaviors found.",
      color: privacy > 0 ? "#f97316" : "#22c55e",
    },
    {
      title: "Author track record",
      value: authorReds > 0 ? `${authorReds} high-risk` : "No high-risk",
      note:
        authorTools != null
          ? `This author has ${authorTools} tools${authorReds > 0 ? `, including ${authorReds} high-risk` : ""}.`
          : "Author stats unavailable.",
      color: authorReds > 0 ? "#ef4444" : "#22c55e",
    },
  ];

  const findingsHtml =
    findings.length === 0
      ? `<p class="muted">No evidence items in this shard yet.</p>`
      : findings
          .map((f) => {
            const sev = SEV[f.severity] || { label: f.severity || "—", cls: "sev-p2" };
            return `
            <article class="finding">
              <div class="finding-top">
                <span class="sev ${sev.cls}">${esc(sev.label)}</span>
                <span class="finding-rule">${esc(f.rule_id || "")}</span>
                <span class="finding-rule">${esc(categoryEn(f.category))}</span>
              </div>
              <h3 class="finding-title">${esc(findingTitle(f))}</h3>
              <p class="finding-body">${esc(findingBody(f))}</p>
            </article>`;
          })
          .join("");

  app.innerHTML = `
    <nav class="crumb">
      <a href="/" data-link>Home</a><span>/</span><span>${esc(name)}</span>
    </nav>
    <div class="detail-head">
      <div>
        <h1 class="detail-title">${esc(name)}</h1>
        <div class="detail-meta">
          ${renderBadge(grade)}
          <span>Category: ${esc(enText(tool.category) || "plugin")}</span>
          <span>Source: DSH</span>
          ${author ? `<span>Author: ${esc(author)}</span>` : ""}
          ${stars != null ? `<span>★ ${stars.toLocaleString()}</span>` : ""}
        </div>
      </div>
    </div>
    <p class="detail-summary">${esc(blurb)}</p>
    <div class="layer-grid">
      ${layers
        .map(
          (l) => `
        <div class="layer-card">
          <h3>${esc(l.title)}</h3>
          <p class="val" style="color:${l.color}">${esc(l.value)}</p>
          <p class="note">${esc(l.note)}</p>
        </div>`
        )
        .join("")}
    </div>
    <section class="panel">
      <h2>Evidence (${findings.length})</h2>
      ${findingsHtml}
    </section>
    <div class="actions">
      <a class="btn btn-ghost" href="/" data-link>Back home</a>
      <a class="btn btn-primary" href="${githubUrl(path)}" target="_blank" rel="noopener">Open on GitHub</a>
    </div>
  `;
}

function renderMethodology() {
  setNav("methodology");
  disconnectSentinel();
  setSeo({
    title: "Methodology — DSH Precheck",
    description:
      "How DSH Precheck grades DeepSeek Harness plugins from publicly verifiable code and declarations.",
    path: "/methodology",
    type: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Methodology — DSH Precheck",
      url: SITE + "/methodology",
      description:
        "How DSH Precheck grades DeepSeek Harness plugins from publicly verifiable code and declarations.",
      isPartOf: { "@type": "WebSite", name: "DSH Precheck", url: SITE + "/" },
    },
  });

  app.innerHTML = `
    <article class="methodology">
      <h1>Methodology</h1>
      <p><strong style="color:#e4e4e7">DSH Precheck</strong> grades DeepSeek Harness plugins from publicly verifiable code and declarations — so you know what a plugin can access before it controls your agent.</p>
      <ul>
        <li><strong style="color:#e4e4e7">Clear</strong> — no clear risk signals under current rules.</li>
        <li><strong style="color:#e4e4e7">Watch</strong> — mild signals; stay informed.</li>
        <li><strong style="color:#e4e4e7">Caution</strong> — risk behaviors found; review evidence first.</li>
        <li><strong style="color:#e4e4e7">High risk</strong> — high-severity evidence found.</li>
        <li><strong style="color:#e4e4e7">Pending</strong> — not enough snapshot or scan evidence yet.</li>
      </ul>
      <p>Grades are not a warranty or penetration-test report.</p>
      <p>CLI: use <a href="https://github.com/clawk2026/dsh-precheck" target="_blank" rel="noopener">dsh-precheck</a> to wrap <code>dsh plugin add</code> with the same grades.</p>
      <div class="actions"><a class="btn btn-ghost" href="/" data-link>Back home</a></div>
    </article>
  `;
}

function parseRoute() {
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const q = new URLSearchParams(location.search).get("q") || "";

  // Legacy hash routes → path
  const hash = location.hash.replace(/^#/, "");
  if (hash.startsWith("/tool/")) {
    const raw = decodeURIComponent(hash.slice("/tool/".length));
    const p = raw.replace(/^dsh:/i, "");
    const [owner, repo] = p.split("/");
    if (owner && repo) {
      history.replaceState(null, "", pluginPath(`dsh:${owner}/${repo}`));
      return { name: "tool", owner, repo };
    }
  }
  if (hash === "/methodology") {
    history.replaceState(null, "", "/methodology");
    return { name: "methodology" };
  }

  if (path === "/" || path === "") return { name: "home", q };
  if (path === "/methodology") return { name: "methodology" };
  const m = path.match(/^\/plugin\/([^/]+)\/([^/]+)$/);
  if (m) return { name: "tool", owner: m[1], repo: m[2] };
  return { name: "home", q };
}

function route() {
  const r = parseRoute();
  if (r.name === "methodology") {
    renderMethodology();
    return;
  }
  if (r.name === "tool") {
    renderTool(r.owner, r.repo);
    return;
  }
  renderHome({ q: r.q || "" });
}

function navigate(href, { replace = false } = {}) {
  const url = new URL(href, location.origin);
  if (url.origin !== location.origin) {
    location.href = href;
    return;
  }
  if (replace) history.replaceState(null, "", url.pathname + url.search + url.hash);
  else history.pushState(null, "", url.pathname + url.search + url.hash);
  route();
  window.scrollTo(0, 0);
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-link]");
  if (!a) return;
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const href = a.getAttribute("href");
  if (!href || href.startsWith("http") || href.startsWith("//")) return;
  e.preventDefault();
  navigate(href);
});

window.addEventListener("popstate", route);
route();
