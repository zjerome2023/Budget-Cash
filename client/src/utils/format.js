// Expense dates are calendar days (no time). API values like "2026-06-22" or
// "2026-06-22T00:00:00.000Z" must not be shifted by the local timezone.
function parseCalendarDate(value) {
  if (!value) return null;

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Date(
    parsed.getUTCFullYear(),
    parsed.getUTCMonth(),
    parsed.getUTCDate()
  );
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount ?? 0);
}

export function formatDate(date) {
  const calendarDate = parseCalendarDate(date);
  if (!calendarDate) return '—';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(calendarDate);
}

export function toDateInputValue(date) {
  const calendarDate = parseCalendarDate(date);
  if (!calendarDate) return todayInputValue();

  const year = calendarDate.getFullYear();
  const month = String(calendarDate.getMonth() + 1).padStart(2, '0');
  const day = String(calendarDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayInputValue() {
  return toDateInputValue(new Date());
}
