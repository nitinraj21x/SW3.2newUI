/**
 * auth.js — JWT verification + RBAC middleware
 */
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied.' });
    }
    next();
  };
}

export const requireAdmin     = requireRole('t-1');
export const requireRecruiter = requireRole('t-1', 't-2');
export const requireAnyUser   = requireRole('t-1', 't-2', 't-3');
