import CategoryManager from '../components/CategoryManager';
import ExpenseForm from '../components/ExpenseForm';
import SummaryCards from '../components/SummaryCards';
import TransactionList from '../components/TransactionList';
import { useAuth } from '../hooks/useAuth';
import { useDashboardData } from '../hooks/useDashboardData';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const {
    categories,
    transactions,
    summary,
    loading,
    error,
    refresh,
  } = useDashboardData();

  async function handleCreateExpense(data) {
    await api.post('/transactions', data);
    await refresh();
  }

  async function handleUpdateTransaction(id, data) {
    await api.put(`/transactions/${id}`, data);
    await refresh();
  }

  async function handleDeleteTransaction(id) {
    await api.delete(`/transactions/${id}`);
    await refresh();
  }

  async function handleCreateCategory(data) {
    await api.post('/categories', data);
    await refresh();
  }

  async function handleUpdateCategory(id, data) {
    await api.put(`/categories/${id}`, data);
    await refresh();
  }

  async function handleDeleteCategory(id) {
    await api.delete(`/categories/${id}`);
    await refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-indigo-600">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.name}. Track expenses and manage your categories.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <SummaryCards summary={summary} loading={loading} />

      <div className="grid gap-8 lg:grid-cols-2">
        <ExpenseForm
          categories={categories}
          onSubmit={handleCreateExpense}
          disabled={loading}
        />
        <CategoryManager
          categories={categories}
          loading={loading}
          onCreate={handleCreateCategory}
          onUpdate={handleUpdateCategory}
          onDelete={handleDeleteCategory}
        />
      </div>

      <TransactionList
        transactions={transactions}
        categories={categories}
        loading={loading}
        onUpdate={handleUpdateTransaction}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
}
