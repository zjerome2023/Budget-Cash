export const DATE_RANGES = {
  WEEK: 'week',
  MONTH: 'month',
  ALL: 'all',
};

export const DATE_RANGE_LABELS = {
  [DATE_RANGES.WEEK]: 'This week',
  [DATE_RANGES.MONTH]: 'This month',
  [DATE_RANGES.ALL]: 'All time',
};

function toISODateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateRangeParams(range) {
  if (range === DATE_RANGES.ALL) {
    return {};
  }

  const end = new Date();
  const start = new Date();

  if (range === DATE_RANGES.WEEK) {
    const day = start.getDay();
    const daysFromMonday = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - daysFromMonday);
  } else {
    start.setDate(1);
  }

  return {
    startDate: toISODateString(start),
    endDate: toISODateString(end),
  };
}

export function getDateRangeLabel(range) {
  return DATE_RANGE_LABELS[range] ?? 'Selected period';
}
