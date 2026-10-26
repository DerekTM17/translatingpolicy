// Marker for copy still owed by the owner. Built from parts so this file
// never contains the literal marker that scripts/check-placeholders.mjs scans for.
export const PLACEHOLDER_PREFIX = '[' + 'DEREK:';
export const isPlaceholder = (s: string) => s.startsWith(PLACEHOLDER_PREFIX);
