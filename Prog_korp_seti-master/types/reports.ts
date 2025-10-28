import { DishCategory } from './dish';

/**
 * Отчёт по выручке
 */
export interface RevenueReport {
  points: RevenueDataPoint[];
  total: {
    revenue: number;
    orders: number;
    avgCheck: number;
  };
}

/**
 * Точка данных для графика выручки
 */
export interface RevenueDataPoint {
  date: string; // YYYY-MM-DD
  revenue: number;
  orders: number;
  avgCheck: number;
}

/**
 * Отчёт по официантам
 */
export interface WaiterReport {
  rows: WaiterReportRow[];
}

/**
 * Строка отчёта по официанту
 */
export interface WaiterReportRow {
  waiterId: number;
  name: string;
  closedOrders: number;
  revenue: number;
  avgCheck: number;
}

/**
 * Отчёт популярности блюд
 */
export interface PopularDishesReport {
  rows: PopularDishRow[];
}

/**
 * Строка отчёта популярного блюда
 */
export interface PopularDishRow {
  dishId: number;
  name: string;
  category: DishCategory;
  qty: number; // Количество заказов
  share: number; // Доля от всех заказов (0-100%)
  revenue: number;
  trend?: 'up' | 'down' | 'stable'; // Тренд по сравнению с прошлым периодом
}

/**
 * Параметры для отчётов
 */
export interface ReportParams {
  from: string; // ISO 8601 или YYYY-MM-DD
  to: string; // ISO 8601 или YYYY-MM-DD
}

/**
 * KPI для дашборда
 */
export interface DashboardKpi {
  todayRevenue: number;
  todayOrders: number;
  avgCheck: number;
  topDish: {
    id: number;
    name: string;
    ordersCount: number;
  } | null;
}
