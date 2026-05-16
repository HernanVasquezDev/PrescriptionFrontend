const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth
export async function login(email: string, password: string) {
  return request<{ accessToken: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getProfile() {
  return request<User>('/auth/profile');
}

// Prescriptions
export async function createPrescription(data: CreatePrescriptionPayload) {
  return request<Prescription>('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPrescriptions(params?: PrescriptionFilters) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status);
  if (params?.from) query.set('from', params.from);
  if (params?.to) query.set('to', params.to);
  return request<PaginatedResponse<Prescription>>(`/prescriptions?${query}`);
}

export async function downloadPrescriptionPdf(id: string): Promise<Blob> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/prescriptions/${id}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to download PDF');
  return res.blob();
}

// Admin
export async function getMetrics(params?: { from?: string; to?: string }) {
  const query = new URLSearchParams();
  if (params?.from) query.set('from', params.from);
  if (params?.to) query.set('to', params.to);
  return request<Metrics>(`/admin/metrics?${query}`);
}

// Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  name: string;
}

export interface PrescriptionItem {
  id: string;
  name: string;
  dosage?: string;
  quantity: number;
  instructions?: string;
  prescriptionId: string;
}

export interface PrescriptionItemDto {
  name: string;
  dosage?: string;
  quantity: number;
  instructions?: string;
}

export interface Prescription {
  id: string;
  code: string;
  patientId: string;
  authorId: string;
  notes?: string;
  status: 'PENDING' | 'CONSUMED' | 'COMPLETED';
  createdAt: string;
  items: PrescriptionItem[];
}

export interface CreatePrescriptionPayload {
  patientId: string;
  notes?: string;
  items: PrescriptionItemDto[];
}

export interface PrescriptionFilters {
  page?: number;
  limit?: number;
  status?: string;
  from?: string;
  to?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; lastPage: number };
}

export interface Metrics {
  totals: { doctors: number; patients: number; prescriptions: number };
  byStatus: { PENDING: number; CONSUMED: number; COMPLETED: number };
  byDay: { date: string; count: number }[];
  topDoctors: { doctorId: string; count: number }[];
}
