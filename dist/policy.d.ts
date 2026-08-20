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
export declare function decide(result: ResolveResult, opts: {
    force?: boolean;
    yes?: boolean;
}): PolicyDecision;
export declare function formatReport(result: ResolveResult): string;
export declare function confirm(prompt: string): Promise<boolean>;
