/** Install policy: red block, orange confirm, fail-soft otherwise. */
import * as readline from "node:readline";
import { CLI_NAME } from "./constants.js";
const GRADE_LABEL = {
    green: "Clear",
    yellow: "Watch",
    orange: "Caution",
    red: "High risk",
    unknown: "Pending",
};
/**
 * Decide what to do with a resolved plugin.
 *
 * Modes:
 *  - `--force`           : always allow (overrides everything but a terminal error).
 *  - `--strict`          : fail-closed — block any plugin that is not positively
 *                          verified (error / missing / scanning / unknown grade).
 *  - default (advisory)  : fail-soft — unverified plugins are allowed but the
 *                          reason string makes clear this is NOT a security
 *                          guarantee. The tool is a soft gate, not a hard wall.
 *
 * `terminal` results (malformed specs) are handled by the caller and never
 * reach an allow decision here.
 */
export function decide(result, opts) {
    if (opts.force) {
        return { action: "allow", reason: "Forced with --force" };
    }
    if (result.status === "skipped") {
        return { action: "allow", reason: result.message || "Skipped" };
    }
    if (opts.strict) {
        // Fail-closed: refuse anything that is not a positively cleared grade
        // (green / yellow). Verified-but-suspicious (orange / red) and everything
        // unverified (error / missing / scanning / unknown) are all blocked.
        const blocked = result.status === "error" ||
            result.status === "missing" ||
            result.status === "scanning" ||
            result.grade === "unknown" ||
            result.grade === "orange" ||
            result.grade === "red";
        if (blocked) {
            const refNote = result.requestedRef ? `, ref=${result.requestedRef}` : "";
            return {
                action: "block",
                reason: `Strict mode: plugin is NOT cleared (grade=${result.grade}, status=${result.status}${refNote}). Refusing to install.`,
                exitCode: 2,
            };
        }
    }
    if (result.status === "error") {
        return {
            action: "allow",
            reason: `Lookup failed (${result.message || "error"}). ADVISORY ONLY — unverified plugins may be unsafe; install allowed (use --strict to block).`,
        };
    }
    if (result.status === "missing" || result.status === "scanning" || result.grade === "unknown") {
        const refNote = result.requestedRef
            ? ` You requested ref '${result.requestedRef}'; trust data covers the default branch only and cannot attest a pinned commit.`
            : "";
        return {
            action: "allow",
            reason: `No grade yet (${result.status}). ADVISORY ONLY — unverified${refNote}; install allowed (use --strict to block).`,
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
export function formatReport(result) {
    const p = `[${CLI_NAME}]`;
    const lines = [];
    lines.push(`${p} grade=${GRADE_LABEL[result.grade]} (${result.grade}) status=${result.status}`);
    if (result.slug)
        lines.push(`${p} slug=${result.slug}`);
    if (result.name)
        lines.push(`${p} name=${result.name}`);
    if (result.findingCount != null)
        lines.push(`${p} evidence=${result.findingCount}`);
    if (result.requestedRef)
        lines.push(`${p} requestedRef=${result.requestedRef}`);
    if (result.detailUrl)
        lines.push(`${p} details=${result.detailUrl}`);
    if (result.message)
        lines.push(`${p} note=${result.message}`);
    if (result.source)
        lines.push(`${p} source=${result.source}`);
    return lines.join("\n");
}
export async function confirm(prompt) {
    if (!process.stdin.isTTY)
        return false;
    const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
    const answer = await new Promise((resolve) => {
        rl.question(`${prompt} [y/N] `, (a) => {
            rl.close();
            resolve(a || "");
        });
    });
    return /^\s*y(es)?\s*$/i.test(answer);
}
//# sourceMappingURL=policy.js.map