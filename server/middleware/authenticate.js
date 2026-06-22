import User from '../models/User.js';
import { verifyToken } from '../utils/token.js';

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookies = req.headers.cookie;
  if (!cookies) return null;

  const match = cookies
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('token='));

  if (!match) return null;
  return decodeURIComponent(match.slice('token='.length));
}

export async function authenticate(req, res, next) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
