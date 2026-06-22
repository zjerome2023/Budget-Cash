import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { getErrorMessage } from '../utils/auth';

export function useDashboardData() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');
      const [categoriesRes, transactionsRes, summaryRes] = await Promise.all([
        api.get('/categories'),
        api.get('/transactions'),
        api.get('/analytics/summary'),
      ]);
      setCategories(categoriesRes.data.categories);
      setTransactions(transactionsRes.data.transactions);
      setSummary(summaryRes.data.summary);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load dashboard data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    categories,
    transactions,
    summary,
    loading,
    error,
    refresh,
    setCategories,
    setTransactions,
    setSummary,
  };
}
