# dsh-plugin-gate

**Installation safety gate & data-protection guard for DeepSeek Harness — 60 static signature rules (31 high / 24 medium / 5 low) scan plugin sources for malicious install scripts, credential theft, obfuscation and network callbacks before you run `dsh plugin add`, and 12 destructive-command patterns plus workspace-boundary checks stop `rm -rf`-class accidents before they happen.**

The plugin marketplace is growing fast (thousands of entries), and malicious code mixed into a plugin is only a matter of time. `dsh-plugin-gate` gives the agent a `gate_scan` tool that inspects a plugin source — a **local directory** or an **npm tarball** — for the classic malware shapes:

| Domain | What it checks |
|---|---|
| **Scripts** | npm lifecycle scripts (pre/install/postinstall), exec/spawn/shell:true, curl|sh, encoded PowerShell, cmd/WSH launch, dynamic require |
| **Obfuscation** | eval / new Function / vm.runIn*, hex-escape floods, base64 blobs, char-array packing |
| **Permissions** | credential env reads (`OPENAI_API_KEY` etc.), ssh/aws/npmrc file reads, writes to system/home/dotfile paths, chmod 777, sandbox-escalation requests |
| **Network** | external URLs & hosts, fetch/axios/socket/WebSocket/DNS APIs, cloud-metadata endpoints (169.254.169.254), Discord/Telegram/Slack webhooks, .onion, read-then-send exfiltration shape |
| **Secrets** | hardcoded `sk-` keys, `ghp_` tokens, AWS keys, private key blocks, bearer tokens |
| **Supply chain** | exact-version direct dependencies checked against **Google OSV** (ranges and official @deepseek-ai packages skipped; configurable, offline-degrades) |

The gate is **read-only**: it never executes scanned code and never writes files.

## Compatibility

Tool schemas are validated against the `@deepseek-ai/dsh-tools` value-schema DSL at plugin load (checked against dsh-tools 0.1.0-rc.6 and 0.1.1-rc.2). Earlier releases used JSON-Schema `required` at the root of `output.schema` and closed nested objects without declared properties, which made the host abort the whole profile boot with `unsupported JSON schema: schema.required is not supported by the value schema DSL` and could reject the tool's own results. Current releases fix both; if an affected version left your DSH unable to start, remove the plugin from the profile (or upgrade) — no data is lost.

## Install

In your DSH profile:

```bash
dsh plugin --profile <profile> add dsh-plugin-gate
# or add the bundle patch manually:
#   dsh --profile <profile> --patch ./node_modules/dsh-plugin-gate/cordis.patch.yml
```

## Usage

Ask the agent to scan a plugin before installing it (the plugin also injects prompt guidance that tells the agent to do this automatically):

```
gate_scan target: "npm:dsh-plugin-some-package"
gate_scan target: "npm:dsh-plugin-some-package@1.2.3"   # pinned version
gate_scan target: "./downloaded-plugin"                 # local directory
```

### v1.3 - Baselines & reports

After a fix, prove the risk is gone — and that nothing new appeared:

    gate_diff target: "npm:dsh-plugin-some-package"          # new / resolved / changed / unchanged vs the stored baseline
    gate_diff target: "./downloaded-plugin" update: true     # store this scan as the new baseline

Findings are fingerprinted by **rule + severity + file** (line shifts do not create false "new" entries). The baseline lives at `.dsh/gate-baseline.json` inside the session workspace.

Attach evidence to a ticket, PR or CI job:

    gate_report target: "npm:dsh-plugin-some-package"                       # Markdown report
    gate_report target: "./plugin" format: "json" write: true               # JSON report written to .dsh/gate-report.json

### v1.1 - Data-protection guard

Before any destructive operation, ask the agent to evaluate it with gate_guard (also injected into prompt guidance):

    gate_guard command: "rm -rf ./node_modules"
    gate_guard path: ".dsh-memory-setup/memory.json" action: "delete"

- **BLOCK** - device/root-level destruction (rm -rf /, rmdir /s /q, format, dd to a block device, mkfs, drive-root deletes): refuse.
- **WARN** - recursive/force deletes, targets outside the workspace, or critical files (memory.json, .git, ...): confirm the exact target first.
- **PASS** - no destructive signature detected.

Result shape:

```json
{
  "verdict": "BLOCK" | "WARN" | "PASS",
  "score": 254,
  "summary": { "high": 0, "medium": 1, "low": 3, "categories": { "network": 4 } },
  "network": { "hosts": [...], "unallowlisted": [...], "readAndSendFiles": [...] },
  "hits": [{ "rule": "fetch_call", "category": "network", "severity": "medium",
             "file": "lib/index.js", "line": 12, "evidence": "...", "hint": "..." }],
  "recommendations": [...]
}
```

### Verdict semantics

- **BLOCK** — at least one high-severity signature. Do not install until the maintainer ships a clean rebuild you can scan again.
- **WARN** — medium-severity patterns that need manual review (network I/O, home-path writes, base64 blobs). Inspect every hit in context.
- **PASS** — no risky signatures. Heuristic only — keep normal caution with unknown maintainers.

Context-aware rules: `exec()`/`execSync()` hits are downgraded when the file does not import `child_process` (typical `RegExp#exec` false positive); code-context rules (exec, eval, curl|sh, PowerShell…) are downgraded to low when found in **comments or documentation** (examples, not behavior) — while secrets and webhooks stay flagged even in comments. Dependencies installed from git/http/file URLs are flagged as `risky_dependency`, and >4000-char minified lines as `minified_line` (low).

## Configuration

| Key | Default | Meaning |
|---|---|---|
| `maxFiles` | 1000 | hard cap on scanned files per directory walk |
| `maxFileBytes` | 2 MiB | per-file text cap |
| `includeNodeModules` | false | descend into node_modules |
| `maxTarballBytes` | 32 MiB | npm tarball download cap |
| `allowlistHosts` | [] | hosts never listed as unallowlisted |
| `osvCheck` | true | query Google OSV for known vulnerabilities on exact-version deps |
| `osvMaxDeps` | 8 | max exact-version direct deps checked |
| `osvTimeoutMs` | 10000 | per-dep OSV query timeout |
| `promptSection` | true | inject agent guidance |
| `sectionOrder` | 5 | prompt section order |

## Development

```bash
node --check lib/*.js
node test/rules.test.mjs   # main-module mode (node --test is blocked in the DSH sandbox)
node test/scan.test.mjs
```

Pure logic lives in `lib/rules.js` (signatures), `lib/targz.js` (in-memory tar.gz), `lib/scan.js` (orchestration + verdict). The Cordis plugin is `lib/index.js`.

## Security

The gate never executes scanned content. It is a heuristic signature scanner — it can miss novel malware and over-flag innocent code. Review BLOCK/WARN hits yourself; see [SECURITY.md](SECURITY.md).

## License

MIT


## Roadmap

See [ROADMAP.md](./ROADMAP.md) — next five versions (v1.3.0 – v1.7.0): baselines & reports, configurable rules, pre-install interception, dependency SBOM, team policy & CI.
