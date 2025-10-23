'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';
import type {
  AnalyticsPeriod,
  AnalyticsReportParams,
  ExportRequest,
} from '@/types';

/**
 * Хук для получения дашборда
 */
export function useDashboard(period: AnalyticsPeriod = 'today') {
  return useQuery({
    queryKey: ['analytics', 'dashboard', period],
    queryFn: () => analyticsApi.getDashboard(period),
    staleTime: 2 * 60 * 1000, // 2 минуты
    refetchInterval: 2 * 60 * 1000, // обновление каждые 2 минуты
  });
}

/**
 * Хук для получения дашборда за кастомный период
 */
export function useCustomDashboard(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics', 'dashboard', 'custom', startDate, endDate],
    queryFn: () => analyticsApi.getCustomDashboard(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

/**
 * Хук для получения real-time метрик
 */
export function useRealTimeMetrics() {
  return useQuery({
    queryKey: ['analytics', 'realtime'],
    queryFn: analyticsApi.getRealTimeMetrics,
    staleTime: 30 * 1000, // 30 секунд
    refetchInterval: 30 * 1000, // обновление каждые 30 секунд
  });
}

/**
 * Хук для получения детального отчета
 */
export function useReport(
  type: 'revenue' | 'menu' | 'staff' | 'customer',
  params: AnalyticsReportParams
) {
  return useQuery({
    queryKey: ['analytics', 'report', type, params],
    queryFn: () => analyticsApi.getReport(type, params),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 15 * 60 * 1000, // 15 минут
  });
}

/**
 * Хук для получения отчета по выручке (расширенный)
 */
export function useDetailedRevenueReport(params: AnalyticsReportParams) {
  return useQuery({
    queryKey: ['analytics', 'report', 'revenue', 'detailed', params],
    queryFn: () => analyticsApi.getRevenueReport(params),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Хук для получения производительности меню
 */
export function useMenuPerformance(period = 'week') {
  return useQuery({
    queryKey: ['analytics', 'menu-performance', period],
    queryFn: () => analyticsApi.getMenuPerformance(period),
    staleTime: 10 * 60 * 1000, // 10 минут
  });
}

/**
 * Хук для получения производительности блюда
 */
export function useDishPerformance(dishId: number, period = 'month') {
  return useQuery({
    queryKey: ['analytics', 'dish-performance', dishId, period],
    queryFn: () => analyticsApi.getDishPerformance(dishId, period),
    enabled: !!dishId,
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Хук для получения топ блюд
 */
export function useTopDishes(
  limit = 10,
  metric: 'revenue' | 'orders' | 'conversion' = 'revenue'
) {
  return useQuery({
    queryKey: ['analytics', 'top-dishes', limit, metric],
    queryFn: () => analyticsApi.getTopDishes(limit, metric),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Хук для получения низкоэффективных блюд
 */
export function useLowPerformers(threshold = 0.05) {
  return useQuery({
    queryKey: ['analytics', 'low-performers', threshold],
    queryFn: () => analyticsApi.getLowPerformers(threshold),
    staleTime: 30 * 60 * 1000, // 30 минут
  });
}

/**
 * Хук для получения метрик персонала
 */
export function useStaffMetrics(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['analytics', 'staff-metrics', startDate, endDate],
    queryFn: () => analyticsApi.getStaffMetrics(startDate, endDate),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Хук для получения метрик официанта
 */
export function useWaiterMetrics(
  waiterId: number,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['analytics', 'waiter-metrics', waiterId, startDate, endDate],
    queryFn: () => analyticsApi.getWaiterMetrics(waiterId, startDate, endDate),
    enabled: !!waiterId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Хук для получения топ официантов
 */
export function useTopWaiters(
  limit = 5,
  metric: 'revenue' | 'orders' | 'efficiency' = 'revenue'
) {
  return useQuery({
    queryKey: ['analytics', 'top-waiters', limit, metric],
    queryFn: () => analyticsApi.getTopWaiters(limit, metric),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Хук для получения анализа загруженности
 */
export function useOccupancyAnalysis(date?: string) {
  return useQuery({
    queryKey: ['analytics', 'occupancy', date],
    queryFn: () => analyticsApi.getOccupancyAnalysis(date),
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Хук для получения пиковых часов
 */
export function usePeakHours(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics', 'peak-hours', startDate, endDate],
    queryFn: () => analyticsApi.getPeakHours(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Хук для получения паттернов загруженности
 */
export function useOccupancyPatterns() {
  return useQuery({
    queryKey: ['analytics', 'occupancy-patterns'],
    queryFn: analyticsApi.getOccupancyPatterns,
    staleTime: 60 * 60 * 1000, // 1 час
  });
}

/**
 * Хук для получения системных метрик
 */
export function useSystemMetrics() {
  return useQuery({
    queryKey: ['analytics', 'system-metrics'],
    queryFn: analyticsApi.getSystemMetrics,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

/**
 * Хук для получения метрик производительности
 */
export function usePerformanceMetrics() {
  return useQuery({
    queryKey: ['analytics', 'performance'],
    queryFn: analyticsApi.getPerformanceMetrics,
    staleTime: 1 * 60 * 1000,
    refetchInterval: 1 * 60 * 1000,
  });
}

/**
 * Хук для сравнения периодов
 */
export function useComparePerformance(
  currentStart: string,
  currentEnd: string,
  previousStart: string,
  previousEnd: string
) {
  return useQuery({
    queryKey: [
      'analytics',
      'compare',
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
    ],
    queryFn: () =>
      analyticsApi.comparePerformance(
        currentStart,
        currentEnd,
        previousStart,
        previousEnd
      ),
    enabled:
      !!currentStart && !!currentEnd && !!previousStart && !!previousEnd,
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Хук для сравнения с прошлым периодом
 */
export function useCompareWithPrevious(period: AnalyticsPeriod) {
  return useQuery({
    queryKey: ['analytics', 'compare-previous', period],
    queryFn: () => analyticsApi.compareWithPrevious(period),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Хук для экспорта данных
 */
export function useExportData() {
  return useMutation({
    mutationFn: (request: ExportRequest) => analyticsApi.exportData(request),
    onSuccess: (blob, variables) => {
      // Автоматически скачиваем файл
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${variables.type}_${variables.startDate}_${variables.endDate}.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
  });
}

/**
 * Хук для экспорта в CSV
 */
export function useExportToCsv() {
  return useMutation({
    mutationFn: ({
      type,
      startDate,
      endDate,
    }: {
      type: string;
      startDate: string;
      endDate: string;
    }) => analyticsApi.exportToCsv(type, startDate, endDate),
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${variables.type}_${variables.startDate}_${variables.endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
  });
}

/**
 * Хук для получения активных алертов
 */
export function useActiveAlerts() {
  return useQuery({
    queryKey: ['analytics', 'alerts'],
    queryFn: analyticsApi.getActiveAlerts,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}

/**
 * Хук для настройки алертов
 */
export function useConfigureAlerts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analyticsApi.configureAlerts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'alerts'] });
    },
  });
}
