import { apiClient } from './client';
import type {
  AnalyticsDashboard,
  AnalyticsPeriod,
  DetailedReport,
  AnalyticsReportParams,
  MenuPerformance,
  StaffMetrics,
  OccupancyAnalysis,
  SystemMetrics,
  ExportRequest,
  ComparativeAnalytics,
} from '@/types';

/**
 * API функции для расширенной аналитики
 */
export const analyticsApi = {
  // ============================================
  // ДАШБОРД
  // ============================================

  /**
   * Получение данных для дашборда
   */
  getDashboard: (period: AnalyticsPeriod = 'today'): Promise<AnalyticsDashboard> =>
    apiClient.get('/analytics/dashboard', { period }),

  /**
   * Получение дашборда за кастомный период
   */
  getCustomDashboard: (startDate: string, endDate: string): Promise<AnalyticsDashboard> =>
    apiClient.get('/analytics/dashboard/custom', { startDate, endDate }),

  /**
   * Получение real-time метрик
   */
  getRealTimeMetrics: (): Promise<{
    activeOrders: number;
    currentRevenue: number;
    occupiedTables: number;
    waitingTime: number;
  }> =>
    apiClient.get('/analytics/realtime'),

  // ============================================
  // ОТЧЕТЫ
  // ============================================

  /**
   * Получение детального отчета
   */
  getReport: (
    type: 'revenue' | 'menu' | 'staff' | 'customer',
    params: AnalyticsReportParams
  ): Promise<DetailedReport> =>
    apiClient.get(`/analytics/reports/${type}`, params),

  /**
   * Получение отчета по выручке
   */
  getRevenueReport: (params: AnalyticsReportParams): Promise<DetailedReport> =>
    apiClient.get('/analytics/reports/revenue', params),

  /**
   * Получение отчета по меню
   */
  getMenuReport: (params: AnalyticsReportParams): Promise<DetailedReport> =>
    apiClient.get('/analytics/reports/menu', params),

  /**
   * Получение отчета по персоналу
   */
  getStaffReport: (params: AnalyticsReportParams): Promise<DetailedReport> =>
    apiClient.get('/analytics/reports/staff', params),

  /**
   * Получение отчета по клиентам
   */
  getCustomerReport: (params: AnalyticsReportParams): Promise<DetailedReport> =>
    apiClient.get('/analytics/reports/customer', params),

  // ============================================
  // ПРОИЗВОДИТЕЛЬНОСТЬ МЕНЮ
  // ============================================

  /**
   * Получение производительности меню
   */
  getMenuPerformance: (period: string = 'week'): Promise<MenuPerformance[]> =>
    apiClient.get('/analytics/menu-performance', { period }),

  /**
   * Получение производительности конкретного блюда
   */
  getDishPerformance: (dishId: number, period: string = 'month'): Promise<MenuPerformance> =>
    apiClient.get(`/analytics/menu-performance/${dishId}`, { period }),

  /**
   * Получение топ блюд
   */
  getTopDishes: (limit = 10, metric: 'revenue' | 'orders' | 'conversion' = 'revenue'): Promise<MenuPerformance[]> =>
    apiClient.get('/analytics/top-dishes', { limit, metric }),

  /**
   * Получение низкоэффективных блюд
   */
  getLowPerformers: (threshold = 0.05): Promise<MenuPerformance[]> =>
    apiClient.get('/analytics/low-performers', { threshold }),

  // ============================================
  // МЕТРИКИ ПЕРСОНАЛА
  // ============================================

  /**
   * Получение метрик всех официантов
   */
  getStaffMetrics: (startDate?: string, endDate?: string): Promise<StaffMetrics[]> =>
    apiClient.get('/analytics/staff', { startDate, endDate }),

  /**
   * Получение метрик конкретного официанта
   */
  getWaiterMetrics: (waiterId: number, startDate?: string, endDate?: string): Promise<StaffMetrics> =>
    apiClient.get(`/analytics/staff/${waiterId}`, { startDate, endDate }),

  /**
   * Получение лучших официантов
   */
  getTopWaiters: (limit = 5, metric: 'revenue' | 'orders' | 'efficiency' = 'revenue'): Promise<StaffMetrics[]> =>
    apiClient.get('/analytics/top-waiters', { limit, metric }),

  // ============================================
  // АНАЛИЗ ЗАГРУЖЕННОСТИ
  // ============================================

  /**
   * Получение анализа загруженности
   */
  getOccupancyAnalysis: (date?: string): Promise<OccupancyAnalysis> =>
    apiClient.get('/analytics/occupancy', { date }),

  /**
   * Получение пиковых часов
   */
  getPeakHours: (startDate: string, endDate: string): Promise<number[]> =>
    apiClient.get('/analytics/peak-hours', { startDate, endDate }),

  /**
   * Получение паттернов загруженности
   */
  getOccupancyPatterns: (): Promise<{
    byDayOfWeek: Record<string, number>;
    byHour: Record<number, number>;
    seasonality: any;
  }> =>
    apiClient.get('/analytics/occupancy-patterns'),

  // ============================================
  // СИСТЕМНЫЕ МЕТРИКИ
  // ============================================

  /**
   * Получение системных метрик
   */
  getSystemMetrics: (): Promise<SystemMetrics> =>
    apiClient.get('/analytics/system-metrics'),

  /**
   * Получение метрик производительности
   */
  getPerformanceMetrics: (): Promise<{
    apiResponseTime: number;
    dbQueryTime: number;
    cacheHitRate: number;
    uptime: number;
  }> =>
    apiClient.get('/analytics/performance'),

  // ============================================
  // СРАВНИТЕЛЬНАЯ АНАЛИТИКА
  // ============================================

  /**
   * Сравнение периодов
   */
  comparePerformance: (currentStart: string, currentEnd: string, previousStart: string, previousEnd: string): Promise<ComparativeAnalytics> =>
    apiClient.get('/analytics/compare', {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
    }),

  /**
   * Сравнение с прошлым периодом
   */
  compareWithPrevious: (period: AnalyticsPeriod): Promise<ComparativeAnalytics> =>
    apiClient.get('/analytics/compare-previous', { period }),

  // ============================================
  // ЭКСПОРТ
  // ============================================

  /**
   * Экспорт данных
   */
  exportData: (request: ExportRequest): Promise<Blob> =>
    apiClient.getBlob('/analytics/export', request),

  /**
   * Экспорт в CSV
   */
  exportToCsv: (type: string, startDate: string, endDate: string): Promise<Blob> =>
    apiClient.getBlob('/analytics/export/csv', { type, startDate, endDate }),

  /**
   * Экспорт в PDF
   */
  exportToPdf: (type: string, startDate: string, endDate: string): Promise<Blob> =>
    apiClient.getBlob('/analytics/export/pdf', { type, startDate, endDate }),

  /**
   * Экспорт в Excel
   */
  exportToExcel: (type: string, startDate: string, endDate: string): Promise<Blob> =>
    apiClient.getBlob('/analytics/export/excel', { type, startDate, endDate }),

  // ============================================
  // УВЕДОМЛЕНИЯ И АЛЕРТЫ
  // ============================================

  /**
   * Получение активных алертов
   */
  getActiveAlerts: (): Promise<Array<{
    type: 'warning' | 'info' | 'success' | 'error';
    message: string;
    timestamp: string;
  }>> =>
    apiClient.get('/analytics/alerts'),

  /**
   * Настройка алертов
   */
  configureAlerts: (config: {
    revenueThreshold?: number;
    occupancyThreshold?: number;
    performanceThreshold?: number;
  }): Promise<void> =>
    apiClient.post('/analytics/alerts/config', config),
};

/**
 * Экспорт для обратной совместимости
 */
export default analyticsApi;
