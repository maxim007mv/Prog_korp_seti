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
    queryFn: async () => {
      console.group('📊 Reports: Загрузка KPI дашборда');
      try {
        const data = await reportsApi.getDashboardKpi();
        console.log('✅ KPI получены:', data);
        console.groupEnd();
        return data;
      } catch (error) {
        console.error('❌ Ошибка загрузки KPI:', error);
        console.groupEnd();
        throw error;
      }
    },
    staleTime: 60 * 1000, // 1 минута
  });
}

/**
 * Хук для получения отчёта по выручке (только закрытые заказы - ПЗ-4)
 */
export function useRevenueReport(params: ReportParams) {
  return useQuery({
    queryKey: ['reports', 'revenue', params],
    queryFn: async () => {
      console.group('💰 Reports: Загрузка отчёта по выручке');
      console.log('Params:', params);
      try {
        const data = await reportsApi.getRevenueReport(params);
        console.log('✅ Отчёт получен:', data);
        console.groupEnd();
        return data;
      } catch (error) {
        console.error('❌ Ошибка загрузки отчёта:', error);
        console.groupEnd();
        throw error;
      }
    },
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
    queryFn: async () => {
      console.group('👨‍💼 Reports: Загрузка отчёта по официантам');
      console.log('Params:', params);
      try {
        const data = await reportsApi.getWaitersReport(params);
        console.log('✅ Отчёт получен:', data);
        console.groupEnd();
        return data;
      } catch (error) {
        console.error('❌ Ошибка загрузки отчёта:', error);
        console.groupEnd();
        throw error;
      }
    },
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
    queryFn: async () => {
      console.group('🍽️ Reports: Загрузка отчёта популярных блюд');
      console.log('Params:', params);
      try {
        const data = await reportsApi.getPopularDishesReport(params);
        console.log('✅ Отчёт получен:', data);
        console.groupEnd();
        return data;
      } catch (error) {
        console.error('❌ Ошибка загрузки отчёта:', error);
        console.groupEnd();
        throw error;
      }
    },
    enabled: !!(params.from && params.to),
    staleTime: 5 * 60 * 1000,
  });
}
