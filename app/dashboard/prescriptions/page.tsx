'use client';
import { useEffect, useState, useCallback } from 'react';
import { getPrescriptions, downloadPrescriptionPdf, Prescription, PaginatedResponse } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const STATUS_OPTIONS = ['', 'PENDING', 'CONSUMED', 'COMPLETED'];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: 'Pendiente', cls: 'badge-pending' },
    CONSUMED: { label: 'Consumida', cls: 'badge-consumed' },
    COMPLETED: { label: 'Completada', cls: 'badge-completed' },
  };
  const { label, cls } = map[status] || { label: status, cls: '' };
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<PaginatedResponse<Prescription> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await getPrescriptions({
        page, limit: 10,
        status: status || undefined,
        from: from || undefined,
        to: to || undefined,
      });
      setData(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar recetas');
    } finally {
      setLoading(false);
    }
  }, [page, status, from, to]);

  useEffect(() => { load(); }, [load]);

  const handleDownload = async (id: string, code: string) => {
    setDownloading(id);
    try {
      const blob = await downloadPrescriptionPdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `receta-${code}.pdf`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al descargar PDF');
    } finally {
      setDownloading(null);
    }
  };

  const applyFilters = () => { setPage(1); load(); };

  return (
    <div style={{ padding: 32 }} className="animate-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: 32, fontWeight: 700 }}>
            {user?.role === 'patient' ? 'Mis recetas' : 'Recetas'}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            {data ? `${data.meta.total} receta${data.meta.total !== 1 ? 's' : ''} en total` : ''}
          </p>
        </div>
        {user?.role === 'doctor' && (
          <Link href="/dashboard/prescriptions/new">
            <button className="btn-primary">⊕ Nueva receta</button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 20, marginBottom: 20, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label className="label">Estado</label>
          <select className="input" value={status} onChange={e => setStatus(e.target.value)}
            style={{ background: 'var(--bg-elevated)', cursor: 'pointer' }}>
            <option value="">Todos</option>
            <option value="PENDING">Pendiente</option>
            <option value="CONSUMED">Consumida</option>
            <option value="COMPLETED">Completada</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label className="label">Desde</label>
          <input className="input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label className="label">Hasta</label>
          <input className="input" type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={applyFilters}>Filtrar</button>
        <button className="btn-ghost" onClick={() => { setStatus(''); setFrom(''); setTo(''); setPage(1); }}>
          Limpiar
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-dim)', border: '1px solid rgba(242,95,92,0.2)', borderRadius: 8, padding: 14, color: 'var(--danger)', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      )}

      {!loading && data && (
        <>
          {data.data.length === 0 ? (
            <div className="card" style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No se encontraron recetas</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.data.map(p => (
                <div key={p.id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: 4 }}>
                          {p.code.slice(0, 8)}...
                        </span>
                        <StatusBadge status={p.status} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {new Date(p.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      {p.notes && (
                        <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--text-secondary)' }}>{p.notes}</p>
                      )}
                      {/* Items */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {p.items.map(item => (
                          <span key={item.id} className="card-elevated" style={{ padding: '4px 10px', fontSize: 12, color: 'var(--text-secondary)' }}>
                            {item.name} × {item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      className="btn-ghost"
                      style={{ flexShrink: 0 }}
                      onClick={() => handleDownload(p.id, p.code)}
                      disabled={downloading === p.id}
                    >
                      {downloading === p.id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '↓'}
                      PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data.meta.lastPage > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
              <button className="btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                ← Anterior
              </button>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Página {page} de {data.meta.lastPage}
              </span>
              <button className="btn-ghost" onClick={() => setPage(p => Math.min(data.meta.lastPage, p + 1))} disabled={page === data.meta.lastPage}>
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
