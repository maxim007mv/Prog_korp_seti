'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import type { ReportParams } from '@/types';

/**
 * Хук для получения KPI дашборда
 */
export function useDashboardKpi() {
  return useQuery({
    queryKey: ['dashboard', 'kpi'],
    queryFn: reportsApi.getDashboardKpi,
    staleTime: 60 * 1000, // 1 минута
  });
}

/**
 * Хук для получения отчёта по выручке (только закрытые заказы - ПЗ-4)
 */
export function useRevenueReport(params: ReportParams) {
  return useQuery({
    queryKey: ['reports', 'revenue', params],
    queryFn: () => reportsApi.getRevenueReport(params),
    enabled: !!(params.from && params.to),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

/**
 * Хук для получения отчёта по официантам
 */
export function useWaitersReport(params: ReportParams) {
  return useQuery({
    queryKey: ['reports', 'waiters', params],
    queryFn: () => reportsApi.getWaitersReport(params),
    enabled: !!(params.from && params.to),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Хук для получения отчёта популярности блюд
 */
export function usePopularDishesReport(params: ReportParams) {
  return useQuery({
    queryKey: ['reports', 'popular', params],
    queryFn: () => reportsApi.getPopularDishesReport(params),
    enabled: !!(params.from && params.to),
    staleTime: 5 * 60 * 1000,
  });
}
