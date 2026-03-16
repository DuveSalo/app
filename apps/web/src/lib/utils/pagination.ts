/**
 * Validates and parses a cursor string for keyset pagination.
 * Cursors are base64-encoded "date|uuid" strings.
 */
const DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseCursor(cursor: string): { cursorDate: string; cursorId: string } {
  const decoded = atob(cursor);
  const separatorIndex = decoded.indexOf('|');
  if (separatorIndex === -1) throw new Error('Invalid cursor format');

  const cursorDate = decoded.substring(0, separatorIndex);
  const cursorId = decoded.substring(separatorIndex + 1);

  if (!DATE_RE.test(cursorDate)) throw new Error('Invalid cursor date');
  if (!UUID_RE.test(cursorId)) throw new Error('Invalid cursor ID');

  return { cursorDate, cursorId };
}
