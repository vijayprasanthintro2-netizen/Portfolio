import { useState } from 'react';
import { adminToken } from '../content/api';
import { AdminLogin } from './AdminLogin';
import { AdminShell } from './AdminShell';

export function AdminApp() {
  const [authed, setAuthed] = useState(() => Boolean(adminToken.get()));

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return (
    <AdminShell
      onLogout={() => {
        adminToken.clear();
        setAuthed(false);
      }}
    />
  );
}