import { useState } from 'react';
import CategoryManager from '../components/CategoryManager';
import DateRangeFilter from '../components/DateRangeFilter';
import ExpenseForm from '../components/ExpenseForm';
import SpendingByCategoryChart from '../components/SpendingByCategoryChart';
import SpendingOverTimeChart from '../components/SpendingOverTimeChart';
import SummaryCards from '../components/SummaryCards';
import TransactionList from '../components/TransactionList';
import { useAuth } from '../hooks/useAuth';
import { useDashboardData } from '../hooks/useDashboardData';
import api from '../services/api';
import { DATE_RANGES } from '../utils/dateRange';

export default function Dashboard() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState(DATE_RANGES.MONTH);
  const {
    categories,
    transactions,
    summary,
    byCategory,
    overTime,
    loading,
    error,
    refresh,
  } = useDashboardData(dateRange);

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-indigo-600">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.name}. Track expenses and manage your categories.
          </p>
        </div>
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          disabled={loading}
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <SummaryCards summary={summary} loading={loading} />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Spending by category</h2>
          <p className="mt-1 text-sm text-gray-500">
            Breakdown of expenses across your categories.
          </p>
          <div className="mt-4">
            <SpendingByCategoryChart data={byCategory} loading={loading} />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Spending over time</h2>
          <p className="mt-1 text-sm text-gray-500">
            Daily totals for the selected period.
          </p>
          <div className="mt-4">
            <SpendingOverTimeChart data={overTime} loading={loading} />
          </div>
        </div>
      </div>

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
