/**
 * Parse a date-only expense value (YYYY-MM-DD) without timezone drift.
 * Stores noon UTC so the calendar day is stable across timezones.
 */
export function parseExpenseDate(value) {
  if (!value) return undefined;

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12, 0, 0));
  }

  return new Date(value);
}
