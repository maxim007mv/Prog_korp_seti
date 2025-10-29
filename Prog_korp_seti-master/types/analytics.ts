/**
 * Типы для расширенной аналитики
 */

/**
 * Период для отчетов
 */
export type AnalyticsPeriod = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom';

/**
 * KPI метрика
 */
export interface KpiMetric {
  value: number;
  change: number; // % изменение
  trend: 'up' | 'down' | 'stable';
}

/**
 * Дашборд KPI
 */
export interface AnalyticsDashboard {
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  kpis: {
    revenue: KpiMetric;
    orders: KpiMetric;
    avgCheck: KpiMetric;
    customers: KpiMetric;
  };
  charts: {
    revenueByHour: Array<{ hour: number; revenue: number; orders: number }>;
    topDishes: Array<{ name: string; count: number; revenue: number }>;
    ordersByCategory: Array<{ category: string; count: number; percentage: number }>;
  };
  alerts: Array<{
    type: 'warning' | 'info' | 'success' | 'error';
    message: string;
    timestamp: string;
  }>;
}

/**
 * Детальный отчет
 */
export interface DetailedReport {
  type: 'revenue' | 'menu' | 'staff' | 'customer';
  startDate: string;
  endDate: string;
  data: any;
  summary: string; // ИИ-генерированный
  charts?: any[];
  tables?: any[];
}

/**
 * Параметры отчета
 */
export interface AnalyticsReportParams {
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month';
}

/**
 * Производительность меню
 */
export interface MenuPerformance {
  dishId: number;
  dishName: string;
  category: string;
  viewCount: number;
  orderCount: number;
  conversionRate: number;
  revenue: number;
  avgRating?: number;
  profitMargin?: number;
  trend: 'rising' | 'falling' | 'stable';
}

/**
 * Метрики официанта
 */
export interface StaffMetrics {
  waiterId: number;
  waiterName: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  avgServiceTime: number;
  customerRatings?: number;
  efficiency: number; // 0-100
  period: {
    start: string;
    end: string;
  };
}

/**
 * Анализ загруженности
 */
export interface OccupancyAnalysis {
  date: string;
  hourlyOccupancy: Array<{
    hour: number;
    occupancyRate: number; // %
    avgWaitTime: number; // minutes
    tablesTurnover: number;
  }>;
  peakHours: number[];
  recommendations: string[];
}

/**
 * Метрики системы
 */
export interface SystemMetrics {
  // Производительность
  apiResponseTime: number; // ms
  dbQueryTime: number;
  cacheHitRate: number; // %
  
  // ИИ
  aiRequestsPerDay: number;
  avgTokensPerRequest: number;
  aiCostPerDay: number; // $
  forecastAccuracy: number; // MAPE
  
  // Бизнес
  dailyRevenue: number;
  orderConversionRate: number;
  customerSatisfaction: number; // 1-5
  staffEfficiency: number;
}

/**
 * Экспорт данных
 */
export interface ExportRequest {
  type: 'revenue' | 'menu' | 'staff' | 'orders';
  format: 'csv' | 'pdf' | 'excel';
  startDate: string;
  endDate: string;
  filters?: Record<string, any>;
}

/**
 * Сравнительная аналитика
 */
export interface ComparativeAnalytics {
  current: {
    period: string;
    revenue: number;
    orders: number;
    avgCheck: number;
  };
  previous: {
    period: string;
    revenue: number;
    orders: number;
    avgCheck: number;
  };
  growth: {
    revenue: number; // %
    orders: number;
    avgCheck: number;
  };
}
