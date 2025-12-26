'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  fallbackUrl?: string;
  loadingComponent?: ReactNode;
}

/**
 * Компонент для защиты клиентских роутов
 * Проверяет авторизацию и роль пользователя
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  fallbackUrl = '/login',
  loadingComponent,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { data: user, isLoading, error } = useCurrentUser();

  // Показываем загрузку
  if (isLoading) {
    return (
      loadingComponent || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      )
    );
  }

  // Пользователь не авторизован
  if (error || !user) {
    router.push(fallbackUrl);
    return null;
  }

  // Проверка роли, если указаны разрешенные роли
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Редирект в зависимости от роли пользователя
    if (user.role === 'admin') {
      router.push('/admin');
    } else if (user.role === 'waiter') {
      router.push('/staff');
    } else {
      router.push('/');
    }
    return null;
  }

  return <>{children}</>;
}
