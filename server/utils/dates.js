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

function parseDateParts(value) {
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match;
  return {
    year: Number(year),
    month: Number(month) - 1,
    day: Number(day),
  };
}

/** Inclusive start of a calendar day in UTC (matches expense date storage). */
export function parseRangeStart(value) {
  const parts = parseDateParts(value);
  if (parts) {
    return new Date(Date.UTC(parts.year, parts.month, parts.day, 0, 0, 0));
  }
  const start = new Date(value);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

/** Inclusive end of a calendar day in UTC (matches expense date storage). */
export function parseRangeEnd(value) {
  const parts = parseDateParts(value);
  if (parts) {
    return new Date(Date.UTC(parts.year, parts.month, parts.day, 23, 59, 59, 999));
  }
  const end = new Date(value);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

export function buildDateRangeBounds(query) {
  if (!query.startDate && !query.endDate) {
    return null;
  }

  const bounds = {};
  if (query.startDate) {
    bounds.$gte = parseRangeStart(query.startDate);
  }
  if (query.endDate) {
    bounds.$lte = parseRangeEnd(query.endDate);
  }
  return bounds;
}
