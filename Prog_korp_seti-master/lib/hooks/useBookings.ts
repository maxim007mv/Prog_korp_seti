'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi, tablesApi } from '@/lib/api';
import type { BookingCreate, BookingSearchParams, TableAvailabilityQuery } from '@/types';

/**
 * Хук для получения всех бронирований
 */
export function useBookings(status?: string) {
  return useQuery({
    queryKey: ['bookings', status],
    queryFn: () => bookingsApi.getBookings(status),
  });
}

/**
 * Хук для поиска бронирований (имя + 4 цифры телефона - ПЗ-3)
 */
export function useSearchBookings(params: BookingSearchParams) {
  return useQuery({
    queryKey: ['bookings', 'search', params],
    queryFn: () => bookingsApi.searchBookings(params),
    enabled: !!(params.name && params.phoneSuffix),
  });
}

/**
 * Хук для получения бронирования по ID
 */
export function useBooking(id: number) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getBooking(id),
    enabled: !!id,
  });
}

/**
 * Хук для создания бронирования
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsApi.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/**
 * Хук для отмены бронирования
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsApi.cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/**
 * Хук для получения доступных столов
 */
export function useAvailableTables(params: TableAvailabilityQuery) {
  return useQuery({
    queryKey: ['tables', 'available', params],
    queryFn: () => tablesApi.getAvailableTables(params),
    enabled: !!(params.start && params.end && params.seats),
    staleTime: 30 * 1000, // 30 секунд - доступность столов может быстро меняться
  });
}

/**
 * Хук для получения всех столов
 */
export function useTables() {
  return useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getTables,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}
