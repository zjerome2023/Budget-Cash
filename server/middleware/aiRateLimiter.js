const userWindows = new Map();

function getLimits() {
  const windowMs = Number.parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS || '3600000', 10);
  const max = Number.parseInt(process.env.AI_RATE_LIMIT_MAX || '30', 10);
  return {
    windowMs: Number.isFinite(windowMs) ? windowMs : 3600000,
    max: Number.isFinite(max) ? max : 30,
  };
}

export function aiRateLimiter(req, res, next) {
  const userId = req.user?._id?.toString() ?? req.user?.id?.toString();
  if (!userId) {
    return next();
  }

  const { windowMs, max } = getLimits();
  const now = Date.now();

  let entry = userWindows.get(userId);
  if (!entry || now - entry.windowStart >= windowMs) {
    entry = { count: 0, windowStart: now };
    userWindows.set(userId, entry);
  }

  if (entry.count >= max) {
    return res.status(429).json({
      message: 'AI request limit reached. Try again later.',
    });
  }

  entry.count += 1;
  next();
}
