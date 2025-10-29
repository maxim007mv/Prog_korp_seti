'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import type { LoginCredentials } from '@/types';

/**
 * Хук для получения текущего пользователя
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

/**
 * Хук для входа
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Сохраняем пользователя в кеш
      queryClient.setQueryData(['auth', 'currentUser'], data.user);
    },
  });
}

/**
 * Хук для выхода
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Очищаем кеш пользователя
      queryClient.setQueryData(['auth', 'currentUser'], null);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

/**
 * Хук для регистрации
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Сохраняем пользователя в кеш
      queryClient.setQueryData(['auth', 'currentUser'], data.user);
    },
  });
}
