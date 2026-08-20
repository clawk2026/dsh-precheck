/** Install policy: red block, orange confirm, fail-soft otherwise. */
import type { ResolveResult } from "./resolve.js";
export type PolicyDecision = {
    action: "allow";
    reason: string;
} | {
    action: "block";
    reason: string;
    exitCode: number;
} | {
    action: "confirm";
    reason: string;
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
export declare function decide(result: ResolveResult, opts: {
    force?: boolean;
    yes?: boolean;
    strict?: boolean;
}): PolicyDecision;
export declare function formatReport(result: ResolveResult): string;
export declare function confirm(prompt: string): Promise<boolean>;
