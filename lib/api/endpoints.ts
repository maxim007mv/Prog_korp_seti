import { apiClient } from './client';
import type {
  MenuData,
  Dish,
  DishInput,
  Table,
  TableInput,
  TableAvailability,
  TableAvailabilityQuery,
  Booking,
  BookingCreate,
  BookingSearchParams,
  Order,
  OrderCreate,
  OrderItemsAdd,
  OrderItemUpdate,
  Receipt,
  RevenueReport,
  WaiterReport,
  PopularDishesReport,
  ReportParams,
  DashboardKpi,
  Waiter,
  WaiterInput,
  AiUpsellResponse,
  AiMenuSearchResponse,
  User,
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
} from '@/types';

/**
 * API функции для работы с меню
 */
export const menuApi = {
  // Получить все меню
  getMenu: () => apiClient.get<MenuData>('/menu'),

  // Получить блюдо по ID
  getDish: (id: number) => apiClient.get<Dish>(`/menu/${id}`),

  // Создать блюдо
  createDish: (data: DishInput) => apiClient.post<Dish>('/menu', data),

  // Обновить блюдо
  updateDish: (id: number, data: Partial<DishInput>) =>
    apiClient.patch<Dish>(`/menu/${id}`, data),

  // Удалить блюдо
  deleteDish: (id: number) => apiClient.delete<void>(`/menu/${id}`),
};

/**
 * API функции для работы со столами
 */
export const tablesApi = {
  // Получить все столы
  getTables: () => apiClient.get<Table[]>('/tables'),

  // Получить доступные столы
  getAvailableTables: (params: TableAvailabilityQuery) =>
    apiClient.get<TableAvailability[]>('/tables/available', params),

  // Получить стол по ID
  getTable: (id: number) => apiClient.get<Table>(`/tables/${id}`),

  // Создать стол
  createTable: (data: TableInput) => apiClient.post<Table>('/tables', data),

  // Обновить стол
  updateTable: (id: number, data: Partial<TableInput>) =>
    apiClient.patch<Table>(`/tables/${id}`, data),

  // Удалить стол
  deleteTable: (id: number) => apiClient.delete<void>(`/tables/${id}`),
};

/**
 * API функции для работы с бронированиями
 */
export const bookingsApi = {
  // Получить все бронирования (по умолчанию только активные для производительности)
  getBookings: (status: string = 'Active') => 
    apiClient.get<Booking[]>('/bookings', { status }),

  // Поиск бронирований (имя + 4 цифры телефона)
  searchBookings: (params: BookingSearchParams) =>
    apiClient.get<Booking[]>('/bookings/search', {
      name: params.name,
      phone: params.phoneSuffix, // Backend ожидает 'phone', а не 'phoneSuffix'
    }),

  // Получить бронирование по ID
  getBooking: (id: number) => apiClient.get<Booking>(`/bookings/${id}`),

  // Создать бронирование
  createBooking: (data: BookingCreate) =>
    apiClient.post<Booking>('/bookings', data),

  // Отменить бронирование
  cancelBooking: (id: number) =>
    apiClient.delete<void>(`/bookings/${id}`),
};

/**
 * API функции для работы с заказами
 */
export const ordersApi = {
  // Получить все заказы
  getOrders: (params?: { status?: string; waiterId?: number }) =>
    apiClient.get<Order[]>('/orders', params),

  // Получить заказ по ID
  getOrder: (id: number) => apiClient.get<Order>(`/orders/${id}`),

  // Создать заказ
  createOrder: (data: OrderCreate) => apiClient.post<Order>('/orders', data),

  // Добавить позиции в заказ
  addOrderItems: (orderId: number, data: OrderItemsAdd) =>
    apiClient.post<Order>(`/orders/${orderId}/items`, data),

  // Обновить позицию в заказе
  updateOrderItem: (orderId: number, itemId: number, data: OrderItemUpdate) =>
    apiClient.patch<Order>(`/orders/${orderId}/items/${itemId}`, data),

  // Удалить позицию из заказа
  deleteOrderItem: (orderId: number, itemId: number) =>
    apiClient.delete<Order>(`/orders/${orderId}/items/${itemId}`),

  // Закрыть заказ
  closeOrder: (id: number) =>
    apiClient.patch<Order>(`/orders/${id}/close`, {}),

  // Получить чек для печати
  getReceipt: (id: number) => apiClient.get<Receipt>(`/orders/${id}/receipt`),
};

/**
 * API функции для работы с отчётами
 */
export const reportsApi = {
  // Дашборд KPI
  getDashboardKpi: () => apiClient.get<DashboardKpi>('/analytics/dashboard'),

  // Отчёт по выручке (только закрытые заказы)
  getRevenueReport: (params: ReportParams) =>
    apiClient.get<RevenueReport>('/analytics/reports/revenue', params),

  // Отчёт по официантам
  getWaitersReport: (params: ReportParams) =>
    apiClient.get<WaiterReport>('/analytics/reports/waiters', params),

  // Отчёт популярности блюд
  getPopularDishesReport: (params: ReportParams) =>
    apiClient.get<PopularDishesReport>('/analytics/reports/popular', params),
};

/**
 * API функции для работы с официантами
 */
export const waitersApi = {
  // Получить всех официантов
  getWaiters: () => apiClient.get<Waiter[]>('/waiters'),

  // Получить официанта по ID
  getWaiter: (id: number) => apiClient.get<Waiter>(`/waiters/${id}`),

  // Создать официанта
  createWaiter: (data: WaiterInput) => apiClient.post<Waiter>('/waiters', data),

  // Обновить официанта
  updateWaiter: (id: number, data: Partial<WaiterInput>) =>
    apiClient.patch<Waiter>(`/waiters/${id}`, data),

  // Деактивировать официанта
  deactivateWaiter: (id: number) =>
    apiClient.patch<Waiter>(`/waiters/${id}`, { isActive: false }),
};

/**
 * API для AI функций (опционально)
 */
export const aiApi = {
  searchMenu: (query: string): Promise<AiMenuSearchResponse> =>
    apiClient.post('/ai/search', { query }),

  getUpsellSuggestions: (orderId: number): Promise<AiUpsellResponse> =>
    apiClient.get(`/ai/upsell/${orderId}`),

  getDailySummary: (date: string): Promise<string> =>
    apiClient.get(`/ai/summary/${date}`),
};

/**
 * API для аутентификации
 */
export const authApi = {
  login: (credentials: LoginCredentials): Promise<LoginResponse> =>
    apiClient.post('/auth/login', credentials),

  register: (credentials: RegisterCredentials): Promise<RegisterResponse> =>
    apiClient.post('/auth/register', credentials),

  logout: (): Promise<void> =>
    apiClient.post('/auth/logout'),

  getCurrentUser: (): Promise<User> =>
    apiClient.get('/auth/me'),

  refreshToken: (): Promise<{ accessToken: string }> =>
    apiClient.post('/auth/refresh'),
};
