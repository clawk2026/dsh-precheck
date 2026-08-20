#!/usr/bin/env node
/**
 * dsh-precheck — wrap `dsh plugin … add <spec>` with a pre-install trust check.
 */

import { spawn } from "node:child_process";
import {
  CLI_NAME,
  DEFAULT_FC_QUERY_URL,
  GITHUB_REPO,
  PRODUCT,
  RETRY_HINT,
  SITE,
  VERSION,
} from "./constants.js";
import { extractAddTarget } from "./normalize.js";
import { decide, formatReport, confirm } from "./policy.js";
import { resolveSpec } from "./resolve.js";

function printHelp(): void {
  console.log(`${PRODUCT} CLI (${CLI_NAME}) v${VERSION}
Pre-install trust check for DeepSeek Harness plugins.
Site: ${SITE}
Repo: ${GITHUB_REPO}

IMPORTANT: This tool is ADVISORY. By default it is a soft gate (fail-soft):
plugins that are missing / scanning / errored / ungraded are allowed, and the
report only says what is currently known. Use --strict to refuse any plugin
that is not positively verified.

Usage:
  ${CLI_NAME} check <spec> [--strict] [--force]
  ${CLI_NAME} plugin [dsh plugin args…]
  ${CLI_NAME} add <spec> [--strict] [--yes] [--force] [--dry-run] [-- dsh plugin args…]

Examples:
  ${CLI_NAME} check github:liustack/modlens
  ${CLI_NAME} check github:liustack/modlens#v2 --strict
  ${CLI_NAME} plugin --profile web add github:liustack/modlens
  ${CLI_NAME} add github:liustack/modlens -- --profile web
  ${CLI_NAME} add github:liustack/modlens --strict --dry-run

Options:
  --strict    Fail-closed: block any plugin that is not verified (missing /
              scanning / error / unknown grade). Default is advisory.
  --force     Override a red block (allow regardless of grade).
  --yes, -y   Auto-accept a Caution (orange) grade without prompting.
  --dry-run   Resolve + decide, but do NOT invoke dsh.
  --version   Print version and exit.
  --help, -h  Show this help.

Policy (default / advisory):
  red     → block (override with --force)
  orange  → confirm (skip prompt with --yes)
  other   → allow
  miss/err/scan/pending → fail-soft (warn, allow) — NOT a security guarantee

With --strict:
  red / orange / miss / err / scan / pending / unknown → block

Exit codes:
  0 allow    2 block (red or --strict)    1 usage / aborted
  3 non-interactive confirm without --yes

Timing:
  ${RETRY_HINT}

Env (all optional — defaults work for most users):
  ZQC_FC_QUERY_URL          FC query base (default: ${DEFAULT_FC_QUERY_URL})
  DSH_PRECHECK_CATALOG_URL  catalog_dsh.json override
  DSH_PRECHECK_URL          detail site (default ${SITE})
  DSH_BIN                   dsh binary (default: dsh)
`);
}

function parseGlobalFlags(argv: string[]) {
  const force = argv.includes("--force");
  const yes = argv.includes("--yes") || argv.includes("-y");
  const dryRun = argv.includes("--dry-run");
  const strict = argv.includes("--strict");
  const version = argv.includes("--version");
  const help = argv.includes("--help") || argv.includes("-h");
  const rest = argv.filter(
    (a) =>
      !["--force", "--yes", "-y", "--dry-run", "--strict", "--version", "--help", "-h"].includes(
        a
      )
  );
  return { force, yes, dryRun, strict, version, help, rest };
}

async function runCheck(
  spec: string,
  opts: { force?: boolean; yes?: boolean; strict?: boolean }
): Promise<number> {
  const result = await resolveSpec(spec);
  console.error(formatReport(result));

  // Client-side hard error (e.g. malformed spec): never pass through.
  if (result.terminal) {
    console.error(`[${CLI_NAME}] cannot resolve spec: ${result.message || "error"}`);
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
      console.error(
        `[${CLI_NAME}] Non-interactive shell: pass --yes to accept Caution, or inspect details URL.`
      );
      return 3;
    }
    const ok = opts.yes || (await confirm(`[${CLI_NAME}] Continue?`));
    return ok ? 0 : 1;
  }
  console.error(`[${CLI_NAME}] ${decision.action}: ${decision.reason}`);
  return 0;
}

async function guardAndMaybeInstall(
  spec: string,
  dshArgs: string[],
  opts: { force?: boolean; yes?: boolean; dryRun?: boolean; strict?: boolean }
): Promise<number> {
  const result = await resolveSpec(spec);
  console.error(formatReport(result));

  // Client-side hard error (e.g. malformed spec): never install.
  if (result.terminal) {
    console.error(`[${CLI_NAME}] cannot resolve spec: ${result.message || "error"}`);
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
      console.error(`[${CLI_NAME}] Non-interactive: pass --yes to install Caution plugins.`);
      return 3;
    }
    const ok = opts.yes || (await confirm(`[${CLI_NAME}] Install anyway?`));
    if (!ok) {
      console.error(`[${CLI_NAME}] Aborted.`);
      return 1;
    }
  } else {
    console.error(`[${CLI_NAME}] ${decision.reason}`);
  }

  if (opts.dryRun) {
    console.error(`[${CLI_NAME}] --dry-run: not invoking dsh`);
    return 0;
  }

  return spawnDsh(dshArgs);
}

function spawnDsh(args: string[]): Promise<number> {
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

async function main(): Promise<number> {
  const { force, yes, dryRun, strict, version, help, rest } = parseGlobalFlags(
    process.argv.slice(2)
  );
  if (version) {
    console.log(`${PRODUCT} (${CLI_NAME}) v${VERSION}`);
    return 0;
  }
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
    return runCheck(spec, { force, yes, strict });
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
    return guardAndMaybeInstall(target, dshArgs, { force, yes, dryRun, strict });
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
    return guardAndMaybeInstall(spec, ["plugin", ...pluginArgs], {
      force,
      yes,
      dryRun,
      strict,
    });
  }

  console.error(`[${CLI_NAME}] unknown command: ${cmd}`);
  printHelp();
  return 1;
}

main().then((code) => process.exit(code));
