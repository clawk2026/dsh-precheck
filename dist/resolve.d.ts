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
};
export declare function detailUrlFor(path?: string): string | undefined;
export declare function resolveSpec(raw: string): Promise<ResolveResult>;
export type { ParsedSpec };
