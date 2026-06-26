export function buildCompactAnalyticsPayload(summary, byCategory, overTime, label) {
  const total = summary.totalSpend;
  const transactionCount = summary.transactionCount;

  return {
    period: label || 'Selected period',
    totalSpend: total,
    transactionCount,
    topCategory: summary.topCategory,
    categories: byCategory.map((c) => ({
      name: c.category,
      total: c.total,
      percent: total > 0 ? Math.round((c.total / total) * 100) : 0,
    })),
    dailyTotals: overTime.map((d) => ({ date: d.period, total: d.total })),
    avgPerTransaction: transactionCount > 0 ? total / transactionCount : 0,
    highestDay:
      overTime.length > 0
        ? overTime.reduce((max, d) => (d.total > max.total ? d : max), overTime[0])
        : null,
  };
}
