/** Shared copy / timing hints (aligned with ~3h collector auto cadence). */

export const PRODUCT = "DSH Precheck";
export const CLI_NAME = "dsh-precheck";
export const VERSION = "0.1.1";
export const SITE = "https://dshprecheck.com";
export const GITHUB_REPO = "https://github.com/clawk2026/dsh-precheck";

/**
 * Public FC query HTTP base (read-only trust + optional enqueue).
 * Override with ZQC_FC_QUERY_URL if needed. This is not a secret key —
 * treat it like any public API origin; protect against abuse on the FC side.
 */
export const DEFAULT_FC_QUERY_URL =
  "https://zhuangqha-query-bvbvcmwrdb.cn-hangzhou.fcapp.run";

/**
 * Unknown plugins are only enqueued. Production collector currently runs
 * `auto` about every 3 hours, so grades are not available in minutes.
 */
export const RETRY_HINT =
  "Results usually appear within a few hours (next scheduled pipeline run, up to about 3 hours). This is not instant.";

export const RETRY_HINT_SHORT = "Check back in a few hours (up to ~3 hours).";
