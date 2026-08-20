# DSH Precheck CLI

Pre-install **trust check** for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugins.

- Website: **[dshprecheck.com](https://dshprecheck.com)**
- Repo: **[github.com/clawk2026/dsh-precheck](https://github.com/clawk2026/dsh-precheck)**

Thin client only — resolves grades from public catalog / FC query API. **No local rule engine.**

## Policy

| Grade | Behavior |
|---|---|
| **red** | Block install (`--force` to override) |
| **orange** | Warn + confirm (`--yes` to skip prompt) |
| green / yellow | Allow |
| missing / network / pending | **Fail-soft** — warn, allow |

## Timing (important)

Submitting an unknown plugin only **queues** it. Production assessment runs on the scheduled pipeline (about every **3 hours**), then catalog export. Grades are **not** ready in a few minutes — check back in a few hours (up to ~3 hours).

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

## Usage

```bash
dsh-precheck check github:liustack/modlens
dsh-precheck check https://github.com/ZSeven-W/dsh-noema

# Wrap dsh plugin add
dsh-precheck plugin --profile web add github:liustack/modlens

# Shorthand (defaults --profile web)
dsh-precheck add github:liustack/modlens

dsh-precheck plugin --profile web add github:liustack/modlens --dry-run
```

## Environment (all optional)

Defaults are baked in for normal use. You only set these to override:

| Var | Required? | Default / meaning |
|---|---|---|
| `ZQC_FC_QUERY_URL` | No | Public query FC base (built-in). Enables `/trust/resolve` + queue. |
| `DSH_PRECHECK_CATALOG_URL` | No | Public `catalog_dsh.json` on OSS |
| `DSH_PRECHECK_URL` | No | `https://dshprecheck.com` |
| `DSH_BIN` | No | `dsh` on PATH |

Without any env vars, `check` still works (catalog + default FC).

## Resolve order

1. `GET {ZQC_FC_QUERY_URL}/trust/resolve?url=…`
2. `GET …/trust/dsh:owner/repo` then `github:owner/repo`
3. Public `catalog_dsh.json`

