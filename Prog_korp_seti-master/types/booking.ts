/**
 * Статус бронирования
 */
export type BookingStatus = 'Active' | 'Cancelled' | 'Completed';

/**
 * Бронирование
 */
export interface Booking {
  id: number;
  clientName: string;
  clientPhone?: string; // Полный номер для админа
  phoneMasked: string; // Маскированный телефон для безопасности
  phoneLastFour: string; // Последние 4 цифры для поиска
  start: string; // ISO 8601
  end: string; // ISO 8601
  comment?: string;
  guestCount?: number; // Количество гостей
  tableId: number;
  table?: {
    id: number;
    location: string;
    seats: number;
  };
  status: BookingStatus;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Создание бронирования
 * Соответствует CreateBookingDto на бэкенде
 */
export interface BookingCreate {
  TableId: number; // PascalCase для совместимости с .NET
  ClientName: string; // PascalCase для совместимости с .NET
  ClientPhone: string; // Полный номер телефона, PascalCase
  StartTime: string; // ISO 8601, PascalCase
  EndTime: string; // ISO 8601, PascalCase
  Comment?: string; // PascalCase
}

/**
 * Поиск бронирования
 */
export interface BookingSearchParams {
  name: string;
  phoneSuffix: string; // Последние 4 цифры
}

/**
 * Параметры для поиска доступных столов
 */
export interface TableAvailabilityQuery {
  start: string; // ISO 8601
  end: string; // ISO 8601
  seats: number;
  location?: string;
}
