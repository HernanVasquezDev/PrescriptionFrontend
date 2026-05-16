'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const navItems = {
  admin: [
    { href: '/dashboard/admin', label: 'Métricas', icon: '◈' },
    { href: '/dashboard/prescriptions', label: 'Recetas', icon: '◎' },
    { href: '/dashboard/profile', label: 'Perfil', icon: '◉' },
  ],
  doctor: [
    { href: '/dashboard/prescriptions', label: 'Recetas', icon: '◎' },
    { href: '/dashboard/prescriptions/new', label: 'Nueva receta', icon: '⊕' },
    { href: '/dashboard/profile', label: 'Perfil', icon: '◉' },
  ],
  patient: [
    { href: '/dashboard/prescriptions', label: 'Mis recetas', icon: '◎' },
    { href: '/dashboard/profile', label: 'Perfil', icon: '◉' },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const items = navItems[user.role] || navItems.patient;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px',
        overflow: 'hidden',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, padding: '0 4px' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'var(--accent-dim)', border: '1px solid rgba(79,142,247,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>⚕</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display), serif' }}>Prescriptions</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{user.role}</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div style={{ padding: '0 4px 12px', overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
          </div>
          <button className="sidebar-link" onClick={logout} style={{ color: 'var(--danger)', width: '100%' }}>
            <span style={{ fontSize: 16 }}>⊗</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  );
}
