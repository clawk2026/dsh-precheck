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
