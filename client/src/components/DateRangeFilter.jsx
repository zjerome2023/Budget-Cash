import { DATE_RANGES, getDateRangeLabel } from '../utils/dateRange';

const OPTIONS = [
  DATE_RANGES.WEEK,
  DATE_RANGES.MONTH,
  DATE_RANGES.ALL,
];

export default function DateRangeFilter({ value, onChange, disabled }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Date range:</span>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((range) => (
          <button
            key={range}
            type="button"
            disabled={disabled}
            onClick={() => onChange(range)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60 ${
              value === range
                ? 'bg-indigo-600 text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {getDateRangeLabel(range)}
          </button>
        ))}
      </div>
    </div>
  );
}
