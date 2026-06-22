import { formatCurrency } from '../utils/format';

export default function SummaryCards({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="animate-pulse rounded-md bg-indigo-50 p-4"
          >
            <div className="h-4 w-24 rounded bg-indigo-100" />
            <div className="mt-3 h-8 w-16 rounded bg-indigo-100" />
          </div>
        ))}
      </div>
    );
  }

  const topCategoryLabel = summary?.topCategory?.category ?? '—';
  const topCategoryAmount = summary?.topCategory
    ? formatCurrency(summary.topCategory.total)
    : null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-md bg-indigo-50 p-4">
        <p className="text-sm font-medium text-indigo-800">Total spent</p>
        <p className="mt-1 text-2xl font-semibold text-indigo-600">
          {formatCurrency(summary?.totalSpend)}
        </p>
      </div>
      <div className="rounded-md bg-indigo-50 p-4">
        <p className="text-sm font-medium text-indigo-800">Transactions</p>
        <p className="mt-1 text-2xl font-semibold text-indigo-600">
          {summary?.transactionCount ?? 0}
        </p>
      </div>
      <div className="rounded-md bg-indigo-50 p-4">
        <p className="text-sm font-medium text-indigo-800">Top category</p>
        <p className="mt-1 text-2xl font-semibold text-indigo-600">
          {topCategoryLabel}
        </p>
        {topCategoryAmount && (
          <p className="mt-1 text-sm text-indigo-700">{topCategoryAmount}</p>
        )}
      </div>
    </div>
  );
}
