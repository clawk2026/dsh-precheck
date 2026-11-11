# DSH Precheck CLI

Pre-install **trust check** for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugins.

- Website: **[dshprecheck.com](https://dshprecheck.com)**
- Repo: **[github.com/clawk2026/dsh-precheck](https://github.com/clawk2026/dsh-precheck)**

Thin client only — resolves grades from public catalog / FC query API. **No local rule engine.**

> **Advisory, not a hard wall.** By default this tool is a *soft gate* (fail-soft):
> plugins that are missing, still scanning, errored, or otherwise ungraded are
> **allowed**, and the report only states what is currently known. A brand-new
> or unknown plugin therefore passes the check until it has been assessed
> (which can take a few hours). If you need a hard boundary, use `--strict`.

## Policy

| Grade | Default (advisory) | With `--strict` |
|---|---|---|
| **red** | Block install (`--force` to override) | Block |
| **orange** | Warn + confirm (`--yes` to skip prompt) | Block |
| green / yellow | Allow | Allow |
| missing / network / pending / unknown | **Fail-soft** — warn, **allow** | **Block** |

### Exit codes

| Code | Meaning |
|---|---|
| `0` | allow |
| `1` | usage error / aborted |
| `2` | block (red, or `--strict` on unverified) |
| `3` | non-interactive confirm prompt without `--yes` |

## Install

```bash
npx github:clawk2026/dsh-precheck check github:owner/repo

# or link locally after clone
git clone https://github.com/clawk2026/dsh-precheck.git
cd dsh-precheck
npm install
npm run build
npm link
```

> After editing anything under `src/`, rebuild with `npm run build` so the
> committed `dist/` stays in sync with the source. `dist/` is **not** git-ignored
> in this repo for exactly this reason.

## Usage

```bash
# Advisory check (default)
dsh-precheck check github:liustack/modlens

# Fail-closed: refuse anything not positively verified
dsh-precheck check github:liustack/modlens --strict

# Wrap dsh plugin add
dsh-precheck plugin --profile web add github:liustack/modlens

# Shorthand (defaults --profile web)
dsh-precheck add github:liustack/modlens

# Dry run: resolve + decide, but don't invoke dsh
dsh-precheck plugin --profile web add github:liustack/modlens --dry-run

# Pinned ref: trust data covers the default branch only and cannot attest
# a specific commit — the report will say so, and --strict will block it.
dsh-precheck check github:liustack/modlens#v2
```

## Ref handling (important)

The backend catalog is keyed at **default-branch granularity**. When you install
a pinned ref (e.g. `github:owner/repo#v2`), the trust check still looks up the
default branch, and the report will explicitly note that the pinned ref is **not**
separately assessed. In `--strict` mode a pinned non-default ref is blocked.

## Timing

Submitting an unknown plugin only **queues** it. Production assessment runs on the scheduled pipeline (about every **3 hours**), then catalog export. Grades are **not** ready in a few minutes — check back in a few hours (up to ~3 hours).

## What the report tells you

The check report separates three things that a single score conflates:

1. **Risk grade** — `green` / `yellow` / `orange` / `red`.
2. **Evidence quality** — `grade_evidence_basis`, per-finding `rule_id`,
   `severity`, `file:line`, `evidence_tier` and capability confidence, as returned
   by the FC `/trust/*` API. A `trust_score` may be shown, but it is explicitly
   **not** a verdict: the grade above is authoritative.
3. **What was never checked** — author identity linkage, runtime behaviour,
   pinned refs / tarballs / local dirs, dependency OSV, and the fact that the
   catalog only covers the default branch.

Example (abbreviated):

```
[dsh-precheck] grade=High risk (red) status=ok
[dsh-precheck] -- evidence --
[dsh-precheck] basis=code trustScore=75 (score is NOT a verdict; grade above is authoritative)
[dsh-precheck] P0 R3_remote_code_exec [README.md:59] tier=3 doc — curl -fsSL ... | bash
[dsh-precheck] P2 CAP_network_access [no file:line reference] — external endpoints ...
[dsh-precheck] -- not assessed --
[dsh-precheck] author identity=UNVERIFIED (no linked GitHub/npm identity)
[dsh-precheck] runtime behavior=NOT executed (a static scan cannot prove what runs)
[dsh-precheck] -- freshness --
[dsh-precheck] last scanned=not reported
[dsh-precheck] last seen=2026-11-10 14:29:14
[dsh-precheck] WARNING scan timestamp not reported by backend; grade freshness cannot be verified
```

`last seen` is not `last scanned`: a plugin can be re-observed daily while its
scan is months old. The backend does not always return `last_scanned_at`, so the
CLI warns both when the timestamp is missing and (when present) when the scan is
older than 30 days. Neither case is silently treated as "fresh".

When the FC API is unreachable and the thin `catalog_dsh.json` fallback is used,
the report says per-finding evidence is unavailable instead of inventing it.
**This is presentation only** — `decide()` and all exit codes are unchanged.
