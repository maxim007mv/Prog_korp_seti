'use client';

import { ReactNode } from 'react';
import { useCurrentUser } from '@/lib/hooks';
import type { UserRole } from '@/types';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

/**
 * Компонент для условного рендеринга на основе роли
 * Используется для скрытия/показа элементов UI в зависимости от прав доступа
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
}: RoleGuardProps) {
  const { data: user, isLoading } = useCurrentUser();

  // Во время загрузки ничего не показываем
  if (isLoading) {
    return null;
  }

  // Если пользователь не авторизован или роль не разрешена
  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RoleCheckProps {
  role: UserRole | UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Упрощенная версия RoleGuard для проверки конкретной роли
 */
export function RoleCheck({ role, children, fallback = null }: RoleCheckProps) {
  const { data: user } = useCurrentUser();

  if (!user) {
    return <>{fallback}</>;
  }

  const roles = Array.isArray(role) ? role : [role];
  
  if (!roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Хуки для проверки ролей
 */
export function useHasRole(role: UserRole | UserRole[]): boolean {
  const { data: user } = useCurrentUser();

  if (!user) return false;

  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
}

export function useIsAdmin(): boolean {
  return useHasRole('admin');
}

export function useIsWaiter(): boolean {
  return useHasRole('waiter');
}

export function useIsClient(): boolean {
  return useHasRole('client');
}
