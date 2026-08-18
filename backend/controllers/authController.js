import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { env } from '../config/env.js';

const SALT_ROUNDS = 10;

// Creates the admin account from environment variables on first start.
export async function seedAdmin() {
  if (!env.admin.password) {
    console.warn('[auth] ADMIN_PASSWORD is not set — admin account was not created.');
    return null;
  }
  const existing = await Admin.findOne({ username: env.admin.username.toLowerCase() });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(env.admin.password, SALT_ROUNDS);
  const admin = await Admin.create({ username: env.admin.username.toLowerCase(), passwordHash });
  console.log(`[auth] Admin account created: "${admin.username}"`);
  return admin;
}

export async function login(req, res) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const admin = await Admin.findOne({ username: String(username).toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const ok = await bcrypt.compare(String(password), admin.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!env.admin.jwtSecret) {
      return res.status(500).json({ success: false, message: 'JWT_SECRET is not configured.' });
    }

    const token = jwt.sign({ sub: admin._id.toString(), username: admin.username }, env.admin.jwtSecret, {
      expiresIn: '7d',
    });

    return res.json({ success: true, token, username: admin.username });
  } catch (err) {
    console.error('[auth] Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed.' });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords are required.' });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    const admin = await Admin.findById(req.adminId);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin account not found.' });
    }

    const ok = await bcrypt.compare(String(currentPassword), admin.passwordHash);
    if (!ok) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    admin.passwordHash = await bcrypt.hash(String(newPassword), SALT_ROUNDS);
    await admin.save();

    return res.json({ success: true, message: 'Password updated.' });
  } catch (err) {
    console.error('[auth] Change password error:', err);
    return res.status(500).json({ success: false, message: 'Could not update password.' });
  }
}
