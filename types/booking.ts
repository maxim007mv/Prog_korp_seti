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
  phoneMasked: string; // Маскированный телефон для безопасности
  phoneLastFour: string; // Последние 4 цифры для поиска
  start: string; // ISO 8601
  end: string; // ISO 8601
  comment?: string;
  tableId: number;
  table?: {
    id: number;
    location: string;
    seats: number;
  };
  status: BookingStatus;
  createdAt: string;
}

/**
 * Создание бронирования
 */
export interface BookingCreate {
  clientName: string;
  phone: string; // Полный номер телефона
  start: string; // ISO 8601
  end: string; // ISO 8601
  guests: number;
  location?: string;
  comment?: string;
  tableId?: number; // Если выбран конкретный стол
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
