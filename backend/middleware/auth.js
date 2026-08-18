import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Requires a valid "Authorization: Bearer <token>" header.
export function protect(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized — missing token.' });
  }
  const token = header.slice(7).trim();
  if (!env.admin.jwtSecret) {
    return res.status(500).json({ success: false, message: 'JWT_SECRET is not configured.' });
  }
  try {
    const payload = jwt.verify(token, env.admin.jwtSecret);
    req.adminId = payload.sub;
    req.adminName = payload.username;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Not authorized — invalid or expired token.' });
  }
}
