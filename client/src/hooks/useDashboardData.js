import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { DATE_RANGES, getDateRangeParams } from '../utils/dateRange';

async function fetchDashboardData(dateRange) {
  const params = getDateRangeParams(dateRange);
  const [
    categoriesRes,
    transactionsRes,
    summaryRes,
    byCategoryRes,
    overTimeRes,
  ] = await Promise.all([
    api.get('/categories'),
    api.get('/transactions', { params }),
    api.get('/analytics/summary', { params }),
    api.get('/analytics/by-category', { params }),
    api.get('/analytics/over-time', { params }),
  ]);

  return {
    categories: categoriesRes.data.categories,
    transactions: transactionsRes.data.transactions,
    summary: summaryRes.data.summary,
    byCategory: byCategoryRes.data.byCategory,
    overTime: overTimeRes.data.overTime,
  };
}

export function useDashboardData(dateRange = DATE_RANGES.MONTH) {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [overTime, setOverTime] = useState([]);
  const [loadedRange, setLoadedRange] = useState(null);
  const [error, setError] = useState('');

  const loading = loadedRange !== dateRange;

  const applyData = useCallback((data) => {
    setCategories(data.categories);
    setTransactions(data.transactions);
    setSummary(data.summary);
    setByCategory(data.byCategory);
    setOverTime(data.overTime);
  }, []);

  const refresh = useCallback(async () => {
    try {
      setError('');
      const data = await fetchDashboardData(dateRange);
      applyData(data);
      setLoadedRange(dateRange);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load dashboard data'));
      setLoadedRange(dateRange);
    }
  }, [applyData, dateRange]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError('');
        const data = await fetchDashboardData(dateRange);
        if (cancelled) return;
        applyData(data);
        setLoadedRange(dateRange);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err, 'Failed to load dashboard data'));
        setLoadedRange(dateRange);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [applyData, dateRange]);

  return {
    categories,
    transactions,
    summary,
    byCategory,
    overTime,
    loading,
    error,
    refresh,
  };
}
