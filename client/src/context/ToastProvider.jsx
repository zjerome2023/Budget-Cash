import { useCallback, useEffect, useMemo, useState } from 'react';
import Toast from '../components/Toast';
import { setApiErrorHandler } from '../services/api';
import { ToastContext } from './toast-context';

const TOAST_DURATION_MS = 5000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'error') => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, message, type }]);

      window.setTimeout(() => {
        dismissToast(id);
      }, TOAST_DURATION_MS);
    },
    [dismissToast]
  );

  useEffect(() => {
    setApiErrorHandler((message) => {
      showToast(message, 'error');
    });

    return () => setApiErrorHandler(null);
  }, [showToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
