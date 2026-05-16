'use client';
import { useEffect, useState } from 'react';
import { getProfile, User } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  doctor: 'Médico',
  patient: 'Paciente',
};

const ROLE_ICONS: Record<string, string> = {
  admin: '🛡',
  doctor: '👨‍⚕️',
  patient: '🧑',
};

export default function ProfilePage() {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar perfil'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 32, maxWidth: 560 }} className="animate-in">
      <h1 style={{ margin: '0 0 6px', fontSize: 32, fontWeight: 700 }}>Mi perfil</h1>
      <p style={{ margin: '0 0 32px', color: 'var(--text-secondary)' }}>Información de tu cuenta</p>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      )}

      {error && (
        <div style={{ background: 'var(--danger-dim)', border: '1px solid rgba(242,95,92,0.2)', borderRadius: 8, padding: 14, color: 'var(--danger)', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {profile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Avatar card */}
          <div className="card" style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--accent-dim)', border: '2px solid rgba(79,142,247,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
              flexShrink: 0,
            }}>
              {ROLE_ICONS[profile.role]}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display), serif', marginBottom: 4 }}>{profile.name}</div>
              <span className="badge badge-consumed">{ROLE_LABELS[profile.role] || profile.role}</span>
            </div>
          </div>

          {/* Details */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Detalles de la cuenta
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'ID de usuario', value: profile.id },
                { label: 'Correo electrónico', value: profile.email },
                { label: 'Nombre', value: profile.name },
                { label: 'Rol', value: ROLE_LABELS[profile.role] || profile.role },
              ].map((row, i) => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: row.label.includes('ID') ? 'monospace' : 'inherit', maxWidth: 260, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button className="btn-ghost" onClick={logout} style={{ color: 'var(--danger)', borderColor: 'rgba(242,95,92,0.3)' }}>
            ⊗ Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
