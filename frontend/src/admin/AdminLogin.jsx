import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User as UserIcon, ArrowRight, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { LogoMark } from '../components/Logo';
import { adminLogin, adminToken } from '../content/api';

export function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setError('');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Enter both your username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await adminLogin(username.trim(), password);
      adminToken.set(res.token, res.username);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Login failed.');
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-bg" aria-hidden="true">
        <span className="a-blob b1" />
        <span className="a-blob b2" />
        <span className="a-blob b3" />
        <span className="a-grid" />
      </div>

      <div className="admin-login-inner">
        <motion.div
          className="admin-login-card"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="admin-login-brand">
            <LogoMark size={44} />
            <div>
              <h1>Portfolio Admin</h1>
              <p>Content management console</p>
            </div>
          </div>

          {error && (
            <div className="admin-login-error" role="alert">
              <ShieldAlert size={16} />
              {error}
            </div>
          )}

          <form onSubmit={submit} noValidate>
            <label className="admin-login-label" htmlFor="a-username">
              Username
            </label>
            <div className="admin-login-input">
              <UserIcon size={17} aria-hidden="true" />
              <input
                id="a-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                autoFocus
              />
            </div>

            <label className="admin-login-label" htmlFor="a-password">
              Password
            </label>
            <div className="admin-login-input">
              <Lock size={17} aria-hidden="true" />
              <input
                id="a-password"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-login-eye"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button className="admin-login-submit" type="submit" disabled={loading}>
              {loading ? (
                <span className="admin-spinner" />
              ) : (
                <>
                  Sign in to console
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <a className="admin-login-back" href="#">
            ← Back to the site
          </a>
        </motion.div>
      </div>
    </div>
  );
}