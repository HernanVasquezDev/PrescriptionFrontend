'use client';
import { useState } from 'react';
import { createPrescription, PrescriptionItemDto } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ItemForm extends PrescriptionItemDto {
  _key: number;
}

let keyCounter = 0;

function newItem(): ItemForm {
  return { _key: keyCounter++, name: '', dosage: '', quantity: 1, instructions: '' };
}

export default function NewPrescriptionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [patientId, setPatientId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ItemForm[]>([newItem()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (user?.role !== 'doctor') {
    return (
      <div style={{ padding: 32 }}>
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--danger)' }}>Solo los médicos pueden crear recetas.</p>
        </div>
      </div>
    );
  }

  const updateItem = (key: number, field: keyof PrescriptionItemDto, value: string | number) => {
    setItems(prev => prev.map(i => i._key === key ? { ...i, [field]: value } : i));
  };

  const removeItem = (key: number) => {
    if (items.length > 1) setItems(prev => prev.filter(i => i._key !== key));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some(i => !i.name.trim())) {
      setError('Todos los medicamentos deben tener un nombre');
      return;
    }
    setLoading(true); setError(''); setSuccess('');
    try {
      const payload = {
        patientId,
        notes: notes || undefined,
        items: items.map(({ _key, ...i }) => ({
          ...i,
          dosage: i.dosage || undefined,
          instructions: i.instructions || undefined,
        })),
      };
      const result = await createPrescription(payload);
      setSuccess(`Receta creada con código: ${result.code}`);
      setTimeout(() => router.push('/dashboard/prescriptions'), 1800);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al crear la receta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 720 }} className="animate-in">
      <div style={{ marginBottom: 32 }}>
        <button
          className="btn-ghost"
          style={{ marginBottom: 16 }}
          onClick={() => router.back()}
        >
          ← Volver
        </button>
        <h1 style={{ margin: '0 0 6px', fontSize: 32, fontWeight: 700 }}>Nueva receta</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Complete los datos para crear una prescripción médica</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Patient */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16 }}>Información del paciente</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">ID del paciente *</label>
              <input
                className="input"
                placeholder="patient-123"
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Notas clínicas</label>
              <textarea
                className="input"
                placeholder="Instrucciones generales, alergias, etc."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Medicamentos</h3>
            <button type="button" className="btn-ghost" onClick={() => setItems(prev => [...prev, newItem()])}>
              ⊕ Agregar
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {items.map((item, idx) => (
              <div key={item._key} className="card-elevated" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Medicamento {idx + 1}
                  </span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(item._key)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 16, padding: 0 }}>
                      ⊗
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Nombre *</label>
                    <input className="input" placeholder="Ibuprofeno" value={item.name} onChange={e => updateItem(item._key, 'name', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Dosis</label>
                    <input className="input" placeholder="400mg" value={item.dosage} onChange={e => updateItem(item._key, 'dosage', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Cantidad *</label>
                    <input className="input" type="number" min={1} value={item.quantity} onChange={e => updateItem(item._key, 'quantity', parseInt(e.target.value) || 1)} required />
                  </div>
                  <div>
                    <label className="label">Instrucciones</label>
                    <input className="input" placeholder="Tomar con comidas" value={item.instructions} onChange={e => updateItem(item._key, 'instructions', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-dim)', border: '1px solid rgba(242,95,92,0.2)', borderRadius: 8, padding: 14, color: 'var(--danger)' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'var(--success-dim)', border: '1px solid rgba(62,207,142,0.2)', borderRadius: 8, padding: 14, color: 'var(--success)' }}>
            ✓ {success}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancelar</button>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
            {loading ? 'Creando...' : 'Crear receta'}
          </button>
        </div>
      </form>
    </div>
  );
}
