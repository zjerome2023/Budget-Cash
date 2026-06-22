import axios from 'axios';
import { getErrorMessage } from '../utils/errors';

const TOKEN_KEY = 'budget_tracker_token';

let onApiError = null;

// Base URL from VITE_API_URL. The Express API enables CORS for local development.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response && onApiError) {
      onApiError(getErrorMessage(error, 'Unable to reach the server'));
    }
    return Promise.reject(error);
  }
);

export function setApiErrorHandler(handler) {
  onApiError = handler;
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
  }
}

export { TOKEN_KEY };
export default api;
