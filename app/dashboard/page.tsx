'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardHome() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user) router.replace(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/prescriptions');
  }, [user, router]);
  return null;
}
