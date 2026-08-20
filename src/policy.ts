/** Install policy: red block, orange confirm, fail-soft otherwise. */

import * as readline from "node:readline";
import { CLI_NAME } from "./constants.js";
import type { Grade, ResolveResult } from "./resolve.js";

export type PolicyDecision =
  | { action: "allow"; reason: string }
  | { action: "block"; reason: string; exitCode: number }
  | { action: "confirm"; reason: string };

const GRADE_LABEL: Record<Grade, string> = {
  green: "Clear",
  yellow: "Watch",
  orange: "Caution",
  red: "High risk",
  unknown: "Pending",
};

export function decide(
  result: ResolveResult,
  opts: { force?: boolean; yes?: boolean }
): PolicyDecision {
  if (opts.force) {
    return { action: "allow", reason: "Forced with --force" };
  }

  if (result.status === "skipped") {
    return { action: "allow", reason: result.message || "Skipped" };
  }

  if (result.status === "error") {
    return {
      action: "allow",
      reason: `Lookup failed (${result.message || "error"}) — fail-soft, install allowed`,
    };
  }

  if (result.status === "missing" || result.status === "scanning" || result.grade === "unknown") {
    return {
      action: "allow",
      reason: `No grade yet (${result.status}) — fail-soft, install allowed`,
    };
  }

  if (result.grade === "red") {
    return {
      action: "block",
      reason: `Blocked: grade is High risk (red). Re-run with --force to override.`,
      exitCode: 2,
    };
  }

  if (result.grade === "orange") {
    if (opts.yes) {
      return { action: "allow", reason: "Caution grade accepted with --yes" };
    }
    return {
      action: "confirm",
      reason: `Caution (orange): review evidence before installing.`,
    };
  }

  return {
    action: "allow",
    reason: `Grade ${GRADE_LABEL[result.grade]} — OK to install`,
  };
}

export function formatReport(result: ResolveResult): string {
  const p = `[${CLI_NAME}]`;
  const lines: string[] = [];
  lines.push(`${p} grade=${GRADE_LABEL[result.grade]} (${result.grade}) status=${result.status}`);
  if (result.slug) lines.push(`${p} slug=${result.slug}`);
  if (result.name) lines.push(`${p} name=${result.name}`);
  if (result.findingCount != null) lines.push(`${p} evidence=${result.findingCount}`);
  if (result.detailUrl) lines.push(`${p} details=${result.detailUrl}`);
  if (result.message) lines.push(`${p} note=${result.message}`);
  if (result.source) lines.push(`${p} source=${result.source}`);
  return lines.join("\n");
}

export async function confirm(prompt: string): Promise<boolean> {
  if (!process.stdin.isTTY) return false;
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
  const answer: string = await new Promise((resolve) => {
    rl.question(`${prompt} [y/N] `, (a) => {
      rl.close();
      resolve(a || "");
    });
  });
  return /^\s*y(es)?\s*$/i.test(answer);
}
