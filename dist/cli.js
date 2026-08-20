#!/usr/bin/env node
/**
 * dsh-precheck — wrap `dsh plugin … add <spec>` with a pre-install trust check.
 */
import { spawn } from "node:child_process";
import { CLI_NAME, DEFAULT_FC_QUERY_URL, GITHUB_REPO, PRODUCT, RETRY_HINT, SITE } from "./constants.js";
import { extractAddTarget } from "./normalize.js";
import { decide, formatReport, confirm } from "./policy.js";
import { resolveSpec } from "./resolve.js";
function printHelp() {
    console.log(`${PRODUCT} CLI (${CLI_NAME})
Pre-install trust check for DeepSeek Harness plugins.
Site: ${SITE}
Repo: ${GITHUB_REPO}

Usage:
  ${CLI_NAME} check <spec>
  ${CLI_NAME} plugin [dsh plugin args…]
  ${CLI_NAME} add <spec> [-- dsh plugin args…]

Examples:
  ${CLI_NAME} check github:liustack/modlens
  ${CLI_NAME} plugin --profile web add github:liustack/modlens
  ${CLI_NAME} add github:liustack/modlens -- --profile web

Policy:
  red     → block (override with --force)
  orange  → confirm (skip prompt with --yes)
  other   → allow
  miss/err→ fail-soft (warn, allow)

Timing:
  ${RETRY_HINT}

Env (all optional — defaults work for most users):
  ZQC_FC_QUERY_URL          FC query base (default: ${DEFAULT_FC_QUERY_URL})
  DSH_PRECHECK_CATALOG_URL  catalog_dsh.json override
  DSH_PRECHECK_URL          detail site (default ${SITE})
  DSH_BIN                   dsh binary (default: dsh)
`);
}
function parseGlobalFlags(argv) {
    const force = argv.includes("--force");
    const yes = argv.includes("--yes") || argv.includes("-y");
    const dryRun = argv.includes("--dry-run");
    const help = argv.includes("--help") || argv.includes("-h");
    const rest = argv.filter((a) => !["--force", "--yes", "-y", "--dry-run", "--help", "-h"].includes(a));
    return { force, yes, dryRun, help, rest };
}
async function runCheck(spec, opts) {
    const result = await resolveSpec(spec);
    console.error(formatReport(result));
    // check-only: bad specs / hard errors should fail the command
    if (result.status === "error") {
        console.error(`[${CLI_NAME}] check failed: ${result.message || "error"}`);
        return 1;
    }
    const decision = decide(result, opts);
    if (decision.action === "block") {
        console.error(`[${CLI_NAME}] ${decision.reason}`);
        return decision.exitCode;
    }
    if (decision.action === "confirm") {
        console.error(`[${CLI_NAME}] ${decision.reason}`);
        if (!process.stdin.isTTY && !opts.yes) {
            console.error(`[${CLI_NAME}] Non-interactive shell: pass --yes to accept Caution, or inspect details URL.`);
            return 3;
        }
        const ok = opts.yes || (await confirm(`[${CLI_NAME}] Continue?`));
        return ok ? 0 : 1;
    }
    console.error(`[${CLI_NAME}] ${decision.action}: ${decision.reason}`);
    return 0;
}
async function guardAndMaybeInstall(spec, dshArgs, opts) {
    const result = await resolveSpec(spec);
    console.error(formatReport(result));
    const decision = decide(result, opts);
    if (decision.action === "block") {
        console.error(`[${CLI_NAME}] ${decision.reason}`);
        return decision.exitCode;
    }
    if (decision.action === "confirm") {
        console.error(`[${CLI_NAME}] ${decision.reason}`);
        if (!process.stdin.isTTY && !opts.yes) {
            console.error(`[${CLI_NAME}] Non-interactive: pass --yes to install Caution plugins.`);
            return 3;
        }
        const ok = opts.yes || (await confirm(`[${CLI_NAME}] Install anyway?`));
        if (!ok) {
            console.error(`[${CLI_NAME}] Aborted.`);
            return 1;
        }
    }
    else {
        console.error(`[${CLI_NAME}] ${decision.reason}`);
    }
    if (opts.dryRun) {
        console.error(`[${CLI_NAME}] --dry-run: not invoking dsh`);
        return 0;
    }
    return spawnDsh(dshArgs);
}
function spawnDsh(args) {
    const bin = process.env.DSH_BIN || "dsh";
    return new Promise((resolve) => {
        const child = spawn(bin, args, { stdio: "inherit", shell: false });
        child.on("error", (err) => {
            console.error(`[${CLI_NAME}] failed to spawn ${bin}: ${err.message}`);
            console.error(`[${CLI_NAME}] Install DeepSeek Harness CLI, or set DSH_BIN.`);
            resolve(127);
        });
        child.on("close", (code) => resolve(code ?? 1));
    });
}
async function main() {
    const { force, yes, dryRun, help, rest } = parseGlobalFlags(process.argv.slice(2));
    if (help || rest.length === 0) {
        printHelp();
        return help ? 0 : 1;
    }
    const cmd = rest[0];
    if (cmd === "check") {
        const spec = rest[1];
        if (!spec) {
            console.error(`[${CLI_NAME}] usage: ${CLI_NAME} check <spec>`);
            return 1;
        }
        return runCheck(spec, { force, yes });
    }
    if (cmd === "plugin") {
        const pluginArgs = rest.slice(1);
        const target = extractAddTarget(pluginArgs);
        const dshArgs = ["plugin", ...pluginArgs];
        if (!target) {
            if (dryRun) {
                console.error(`[${CLI_NAME}] no add target; --dry-run pass-through skipped`);
                return 0;
            }
            return spawnDsh(dshArgs);
        }
        return guardAndMaybeInstall(target, dshArgs, { force, yes, dryRun });
    }
    if (cmd === "add") {
        const spec = rest[1];
        if (!spec) {
            console.error(`[${CLI_NAME}] usage: ${CLI_NAME} add <spec> -- [--profile web]`);
            return 1;
        }
        const dd = rest.indexOf("--");
        const passthrough = dd >= 0 ? rest.slice(dd + 1) : rest.slice(2);
        const hasProfile = passthrough.some((a) => a === "--profile" || a === "-p");
        const pluginArgs = hasProfile
            ? ["add", spec, ...passthrough]
            : ["--profile", "web", "add", spec, ...passthrough];
        return guardAndMaybeInstall(spec, ["plugin", ...pluginArgs], { force, yes, dryRun });
    }
    console.error(`[${CLI_NAME}] unknown command: ${cmd}`);
    printHelp();
    return 1;
}
main().then((code) => process.exit(code));
//# sourceMappingURL=cli.js.map