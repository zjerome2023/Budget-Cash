import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { DATE_RANGE_LABELS, getDateRangeParams } from '../utils/dateRange';
import { getErrorMessage } from '../utils/errors';
import LoginPrompt from './LoginPrompt';

export default function InsightsPanel({ dateRange, disabled = false }) {
  const { isAuthenticated } = useAuth();
  const [insights, setInsights] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGenerate(forceRefresh = false) {
    if (!isAuthenticated || loading) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/spending-insights', {
        ...getDateRangeParams(dateRange),
        dateRangeLabel: DATE_RANGE_LABELS[dateRange] ?? 'Selected period',
        forceRefresh,
      });

      setInsights(data.insights ?? null);
      setMessage(data.message ?? '');
    } catch (err) {
      setInsights(null);
      setMessage('');
      setError(getErrorMessage(err, 'Unable to generate insights right now.'));
    } finally {
      setLoading(false);
    }
  }

  const buttonLabel = loading
    ? 'Analyzing…'
    : insights
      ? 'Regenerate'
      : 'Generate insights';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">AI spending insights</h2>
          <p className="mt-1 text-sm text-gray-500">
            Plain-English summary for {DATE_RANGE_LABELS[dateRange] ?? 'the selected period'}.
          </p>
        </div>

        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => handleGenerate(Boolean(insights))}
            disabled={disabled || loading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {buttonLabel}
          </button>
        ) : null}
      </div>

      {!isAuthenticated && (
        <div className="mt-4">
          <LoginPrompt message="Please log in to generate AI spending insights." />
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && !insights && !error && (
        <p className="mt-4 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          {message}
        </p>
      )}

      {insights && (
        <div className="mt-4 space-y-4">
          <ul className="list-disc space-y-2 pl-5 text-sm text-gray-800">
            {insights.bullets.map((bullet, index) => (
              <li key={`${index}-${bullet}`}>{bullet}</li>
            ))}
          </ul>

          {insights.tip && (
            <div className="rounded-md border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
              <p className="font-medium">Tip</p>
              <p className="mt-1">{insights.tip}</p>
            </div>
          )}

          {insights.cached && (
            <p className="text-xs text-gray-500">Showing cached insights for this period.</p>
          )}
        </div>
      )}
    </div>
  );
}
