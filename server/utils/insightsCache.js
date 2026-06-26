const CACHE_TTL_MS = 60 * 60 * 1000;

const cache = new Map();

function buildCacheKey(userId, startDate, endDate) {
  return `${userId}:${startDate ?? ''}:${endDate ?? ''}`;
}

export function getCachedInsights(userId, startDate, endDate) {
  const key = buildCacheKey(userId, startDate, endDate);
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.insights;
}

export function setCachedInsights(userId, startDate, endDate, insights) {
  const key = buildCacheKey(userId, startDate, endDate);
  cache.set(key, {
    insights,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}
