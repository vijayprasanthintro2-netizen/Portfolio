import { useCallback, useState } from 'react';
import { adminToken } from '../content/api';
import { applyAdminTheme, readAdminTheme } from './theme';
import { AdminLogin } from './AdminLogin';
import { AdminShell } from './AdminShell';

// Apply the saved (or default light) admin theme before the login screen or
// shell renders on a fresh page load.
if (typeof document !== 'undefined') {
  applyAdminTheme(readAdminTheme());
}

export function AdminApp() {
  const [authed, setAuthed] = useState(() => Boolean(adminToken.get()));

  const handleLogout = useCallback(() => {
    adminToken.clear();
    setAuthed(false);
  }, []);

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return <AdminShell onLogout={handleLogout} />;
}
