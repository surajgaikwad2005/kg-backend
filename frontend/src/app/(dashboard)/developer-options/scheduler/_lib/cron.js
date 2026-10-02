/**
 * 5-field cron labels/defaults (minute hour day-of-month month day-of-week).
 * No validation is applied — the Create Schedule form accepts whatever the
 * user types in each field.
 */
export const CRON_FIELD_LABELS = ['MINUTE', 'HOUR', 'DAY (MONTH)', 'MONTH', 'DAY (WEEK)'];
export const CRON_DEFAULT_FIELDS = ['*', '*', '*', '*', '*'];
