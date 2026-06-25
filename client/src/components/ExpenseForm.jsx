import { useEffect, useState } from 'react';
import { useCategorySuggestion } from '../hooks/useCategorySuggestion';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { getErrorMessage } from '../utils/auth';
import { todayInputValue } from '../utils/format';

const inputClassName =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export default function ExpenseForm({ categories, onSubmit, disabled }) {
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(todayInputValue());
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  const { suggestion, loading: suggestionLoading, clearSuggestion } = useCategorySuggestion(
    description,
    categories,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    setSuggestionDismissed(false);
  }, [description, suggestion?.categoryId]);

  function resetForm() {
    setAmount('');
    setCategoryId('');
    setDate(todayInputValue());
    setDescription('');
    setError('');
    setSuggestionDismissed(false);
    clearSuggestion();
  }

  function handleAcceptSuggestion() {
    if (!suggestion?.categoryId) return;
    setCategoryId(suggestion.categoryId);
    clearSuggestion();
    setSuggestionDismissed(false);
  }

  function handleDismissSuggestion() {
    setSuggestionDismissed(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    requireAuth(async () => {
      const parsedAmount = Number.parseFloat(amount);
      if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        setError('Enter a valid amount greater than zero');
        return;
      }
      if (!categoryId) {
        setError('Select a category');
        return;
      }
      if (!date) {
        setError('Select a date');
        return;
      }

      setSubmitting(true);
      try {
        await onSubmit({
          amount: parsedAmount,
          categoryId,
          date,
          description: description.trim(),
        });
        resetForm();
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to add expense'));
      } finally {
        setSubmitting(false);
      }
    }, 'Please log in to add an expense.');
  }

  const noCategories = categories.length === 0;
  const formDisabled = disabled || submitting || !isAuthenticated || noCategories;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Add expense</h2>
      <p className="mt-1 text-sm text-gray-500">
        Record a new transaction with amount, category, and date.
      </p>

      {noCategories && (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Create at least one category before adding expenses.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={formDisabled}
              className={inputClassName}
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={formDisabled}
              className={inputClassName}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={formDisabled}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={formDisabled}
              className={inputClassName}
              placeholder="Optional memo"
              maxLength={500}
            />
            {isAuthenticated && (suggestionLoading || (suggestion && !suggestionDismissed)) && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                {suggestionLoading && (
                  <span className="text-gray-500">Finding category…</span>
                )}
                {suggestion && !suggestionLoading && !suggestionDismissed && (
                  <>
                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-indigo-900">
                      Suggested: {suggestion.categoryName}
                    </span>
                    <button
                      type="button"
                      onClick={handleAcceptSuggestion}
                      className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={handleDismissSuggestion}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Dismiss
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={formDisabled}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Adding…' : 'Add expense'}
        </button>
      </form>
    </div>
  );
}
