import { useState } from 'react';
import { getErrorMessage } from '../utils/auth';

const PRESET_COLORS = [
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#6B7280',
];

const inputClassName =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

function CategoryForm({ initialName = '', initialColor = '#6B7280', submitLabel, onSubmit, onCancel }) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ name: trimmedName, color });
      if (!onCancel) {
        setName('');
        setColor('#6B7280');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save category'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="category-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClassName}
          placeholder="e.g. Food"
        />
      </div>

      <div>
        <label htmlFor="category-color" className="block text-sm font-medium text-gray-700">
          Color
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setColor(preset)}
              className={`h-7 w-7 rounded-full border-2 ${
                color === preset ? 'border-gray-900' : 'border-transparent'
              }`}
              style={{ backgroundColor: preset }}
              aria-label={`Select color ${preset}`}
            />
          ))}
          <input
            id="category-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-gray-300"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function CategoryManager({
  categories,
  loading,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(categoryId) {
    setDeleteError('');
    setDeleting(true);
    try {
      await onDelete(categoryId);
      setDeletingId(null);
    } catch (err) {
      setDeleteError(getErrorMessage(err, 'Failed to delete category'));
    } finally {
      setDeleting(false);
    }
  }

  const editingCategory = categories.find((category) => category._id === editingId);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
      <p className="mt-1 text-sm text-gray-500">
        Manage spending categories used in your expense form.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-gray-500">Loading categories…</p>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-gray-100">
            {categories.length === 0 ? (
              <li className="py-4 text-sm text-gray-500">
                No categories yet. Add one below to get started.
              </li>
            ) : (
              categories.map((category) => (
                <li key={category._id} className="py-3">
                  {editingId === category._id ? (
                    <CategoryForm
                      initialName={category.name}
                      initialColor={category.color}
                      submitLabel="Update category"
                      onSubmit={async (data) => {
                        await onUpdate(category._id, data);
                        setEditingId(null);
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                      <div className="flex gap-3 text-sm">
                        <button
                          type="button"
                          onClick={() => setEditingId(category._id)}
                          className="font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError('');
                            setDeletingId(category._id);
                          }}
                          className="font-medium text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}

                  {deletingId === category._id && editingId !== category._id && (
                    <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
                      <p className="text-sm text-red-800">
                        Delete &quot;{category.name}&quot;? Transactions using this category may
                        become invalid.
                      </p>
                      {deleteError && (
                        <p className="mt-2 text-sm text-red-700">{deleteError}</p>
                      )}
                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleDelete(category._id)}
                          disabled={deleting}
                          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          {deleting ? 'Deleting…' : 'Confirm delete'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>

          {!editingCategory && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-medium text-gray-900">Add category</h3>
              <div className="mt-3">
                <CategoryForm submitLabel="Add category" onSubmit={onCreate} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
