/** Remote grade resolution: FC /trust/resolve first, then catalog_dsh.json. */
import { type ParsedSpec } from "./normalize.js";
export type Grade = "green" | "yellow" | "orange" | "red" | "unknown";
/** One finding from the backend scan. May lack a code reference (doc/LLM tier). */
export type EvidenceFinding = {
    ruleId: string | null;
    severity: string | null;
    category: string | null;
    filePath: string | null;
    lineNo: number | null;
    evidence: string | null;
    evidenceTier: number | null;
    pathClass: string | null;
};
/** Declared/inferred capability with its evidence quality. */
export type Capability = {
    name: string | null;
    level: number | null;
    confidence: string | null;
    evidenceTier: number | null;
    evidenceClass: string | null;
};
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
    trustScore?: number | null;
    gradeEvidenceBasis?: string | null;
    firstSeenAt?: string | null;
    lastSeenAt?: string | null;
    lastScannedAt?: string | null;
    /** true = linked identity found; false = author known but unlinked; null = unknown. */
    authorVerified?: boolean | null;
    findings?: EvidenceFinding[];
    capabilities?: Capability[];
    /** Set when the source cannot supply per-finding evidence (catalog). */
    evidenceLimited?: boolean;
};
export declare function detailUrlFor(path?: string): string | undefined;
export declare function resolveSpec(raw: string): Promise<ResolveResult>;
export type { ParsedSpec };
