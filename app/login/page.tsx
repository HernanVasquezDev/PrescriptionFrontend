'use client';
import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        opacity: 0.3,
      }} />
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-in" style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--accent-dim)',
            border: '1px solid rgba(79,142,247,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 24,
          }}>⚕</div>
          <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
            Prescriptions
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>
            Plataforma médica de recetas
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="label">Correo electrónico</label>
              <input
                className="input"
                type="email"
                placeholder="doctor@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--danger-dim)',
                border: '1px solid rgba(242,95,92,0.2)',
                borderRadius: 8, padding: '10px 14px',
                color: 'var(--danger)', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', marginTop: 4 }}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : null}
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 12 }}>
          Acceso restringido a personal autorizado
        </p>
      </div>
    </div>
  );
}
