'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi } from '@/lib/api';
import type { DishInput } from '@/types';

/**
 * Хук для получения меню
 */
export function useMenu() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: menuApi.getMenu,
    staleTime: 5 * 60 * 1000, // 5 минут - меню редко меняется
  });
}

/**
 * Хук для получения блюда по ID
 */
export function useDish(id: number) {
  return useQuery({
    queryKey: ['dish', id],
    queryFn: () => menuApi.getDish(id),
    enabled: !!id,
  });
}

/**
 * Хук для создания блюда
 */
export function useCreateDish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuApi.createDish,
    onSuccess: () => {
      // Инвалидируем кэш меню
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}

/**
 * Хук для обновления блюда
 */
export function useUpdateDish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DishInput> }) =>
      menuApi.updateDish(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      queryClient.invalidateQueries({ queryKey: ['dish', variables.id] });
    },
  });
}

/**
 * Хук для удаления блюда
 */
export function useDeleteDish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuApi.deleteDish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}
