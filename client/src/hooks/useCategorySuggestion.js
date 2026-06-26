import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';

export function useCategorySuggestion(description, categories, { enabled = true } = {}) {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  const trimmed = description.trim();
  const shouldFetch = enabled && trimmed.length >= 3 && categories.length > 0;

  const clearSuggestion = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSuggestion(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!shouldFetch) {
      abortRef.current?.abort();
      abortRef.current = null;
      return undefined;
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setSuggestion(null);

      try {
        const { data } = await api.post(
          '/ai/suggest-category',
          { description: trimmed },
          { signal: controller.signal }
        );

        if (!controller.signal.aborted) {
          setSuggestion(data.suggestion ?? null);
        }
      } catch (err) {
        if (err.code !== 'ERR_CANCELED' && err.name !== 'CanceledError') {
          setSuggestion(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [trimmed, categories, shouldFetch]);

  return {
    suggestion: shouldFetch ? suggestion : null,
    loading: shouldFetch && loading,
    clearSuggestion,
  };
}
