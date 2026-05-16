'use client';
import { useEffect, useState } from 'react';
import { getMetrics, Metrics } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const PIE_COLORS = ['#f5a623', '#4f8ef7', '#3ecf8e'];

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    if (user && user.role !== 'admin') router.push('/dashboard/prescriptions');
  }, [user, router]);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const data = await getMetrics({ from: from || undefined, to: to || undefined });
      setMetrics(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const statusData = metrics ? [
    { name: 'Pendiente', value: metrics.byStatus.PENDING },
    { name: 'Consumida', value: metrics.byStatus.CONSUMED },
    { name: 'Completada', value: metrics.byStatus.COMPLETED },
  ] : [];

  return (
    <div style={{ padding: 32 }} className="animate-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 32, fontWeight: 700 }}>Panel de métricas</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Estadísticas globales del sistema</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 20, marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label className="label">Desde</label>
          <input className="input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label className="label">Hasta</label>
          <input className="input" type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={load} disabled={loading}>
          {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '↻'}
          Actualizar
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-dim)', border: '1px solid rgba(242,95,92,0.2)', borderRadius: 8, padding: 14, color: 'var(--danger)', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {loading && !metrics && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      )}

      {metrics && (
        <>
          {/* Totals */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Doctores', value: metrics.totals.doctors, icon: '👨‍⚕️', color: 'var(--accent)' },
              { label: 'Pacientes', value: metrics.totals.patients, icon: '🧑', color: 'var(--success)' },
              { label: 'Recetas', value: metrics.totals.prescriptions, icon: '📋', color: 'var(--warning)' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: s.color, fontFamily: 'var(--font-display), serif', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* Area chart */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>Recetas por día</h3>
              {metrics.byDay.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={metrics.byDay}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f8ef7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: '#4a5266', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4a5266', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 8, color: 'var(--text-primary)' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#4f8ef7" fill="url(#areaGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Sin datos en el período</div>
              )}
            </div>

            {/* Pie chart */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>Por estado</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  <Legend iconType="circle" wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Doctors */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>Top médicos por recetas</h3>
            {metrics.topDoctors.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Sin datos</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {metrics.topDoctors.map((d, i) => {
                  const max = metrics.topDoctors[0]?.count || 1;
                  const pct = (d.count / max) * 100;
                  return (
                    <div key={d.doctorId} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ width: 20, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>#{i + 1}</span>
                      <span style={{ width: 160, fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.doctorId}</span>
                      <div style={{ flex: 1, height: 6, background: 'var(--border-light)', borderRadius: 3 }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 3, transition: 'width 0.6s ease' }} />
                      </div>
                      <span style={{ width: 30, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right' }}>{d.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
