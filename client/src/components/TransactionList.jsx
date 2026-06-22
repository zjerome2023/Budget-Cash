import { useEffect, useState } from 'react';
import { getErrorMessage } from '../utils/auth';
import { formatCurrency, formatDate, toDateInputValue } from '../utils/format';

const inputClassName =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EditTransactionModal({ transaction, categories, onClose, onSave }) {
  const [amount, setAmount] = useState(String(transaction.amount));
  const [categoryId, setCategoryId] = useState(transaction.categoryId._id);
  const [date, setDate] = useState(toDateInputValue(transaction.date));
  const [description, setDescription] = useState(transaction.description || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const parsedAmount = Number.parseFloat(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid amount greater than zero');
      return;
    }
    if (!categoryId) {
      setError('Select a category');
      return;
    }

    setSubmitting(true);
    try {
      await onSave(transaction._id, {
        amount: parsedAmount,
        categoryId,
        date,
        description: description.trim(),
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update transaction'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Edit transaction" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            id="edit-amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="edit-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClassName}
          >
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            id="edit-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            id="edit-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClassName}
            maxLength={500}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteConfirmModal({ transaction, onClose, onConfirm }) {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleDelete() {
    setError('');
    setSubmitting(true);
    try {
      await onConfirm(transaction._id);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete transaction'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Delete transaction" onClose={onClose}>
      <p className="text-sm text-gray-600">
        Delete{' '}
        <span className="font-medium text-gray-900">
          {formatCurrency(transaction.amount)}
        </span>{' '}
        from {formatDate(transaction.date)}? This cannot be undone.
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={submitting}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {submitting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}

export default function TransactionList({
  transactions,
  categories,
  loading,
  onUpdate,
  onDelete,
}) {
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);

  useEffect(() => {
    if (editingTransaction) {
      const stillExists = transactions.some((tx) => tx._id === editingTransaction._id);
      if (!stillExists) {
        setEditingTransaction(null);
      }
    }
  }, [transactions, editingTransaction]);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
        <p className="mt-4 text-sm text-gray-500">Loading transactions…</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
      <p className="mt-1 text-sm text-gray-500">
        Review, edit, or delete your recorded expenses.
      </p>

      {transactions.length === 0 ? (
        <p className="mt-6 rounded-md border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
          No transactions yet. Add your first expense above.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 pr-4 font-medium">Description</th>
                <th className="py-2 pr-4 font-medium">Amount</th>
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td className="py-3 pr-4 text-gray-700">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: transaction.categoryId?.color || '#6B7280' }}
                      />
                      {transaction.categoryId?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {transaction.description || '—'}
                  </td>
                  <td className="py-3 pr-4 font-medium text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingTransaction(transaction)}
                        className="font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingTransaction(transaction)}
                        className="font-medium text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          categories={categories}
          onClose={() => setEditingTransaction(null)}
          onSave={onUpdate}
        />
      )}

      {deletingTransaction && (
        <DeleteConfirmModal
          transaction={deletingTransaction}
          onClose={() => setDeletingTransaction(null)}
          onConfirm={onDelete}
        />
      )}
    </div>
  );
}
