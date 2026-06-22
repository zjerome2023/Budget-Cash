export function getErrorMessage(error, fallback = 'Something went wrong') {
  if (!error.response) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return 'Unable to reach the server. Check your connection and try again.';
    }
    return fallback;
  }

  const data = error.response.data;
  if (data?.message) return data.message;
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    return first.msg || first.message || fallback;
  }

  return fallback;
}
