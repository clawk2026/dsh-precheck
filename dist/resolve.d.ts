/** Remote grade resolution: FC /trust/resolve first, then catalog_dsh.json. */
import { type ParsedSpec } from "./normalize.js";
export type Grade = "green" | "yellow" | "orange" | "red" | "unknown";
export type ResolveResult = {
    status: "ok" | "scanning" | "missing" | "error" | "skipped";
    grade: Grade;
    slug?: string;
    name?: string;
    findingCount?: number;
    message?: string;
    detailUrl?: string;
    source?: "resolve" | "trust" | "catalog" | "local";
    /** Ref requested by the user (e.g. github:owner/repo#v2). Included so
     *  callers can warn that trust data covers the default branch only. */
    requestedRef?: string;
    /** Client-side hard error (e.g. malformed spec): do not pass through to
     *  the installer even in advisory mode. */
    terminal?: boolean;
};
export declare function detailUrlFor(path?: string): string | undefined;
export declare function resolveSpec(raw: string): Promise<ResolveResult>;
export type { ParsedSpec };
