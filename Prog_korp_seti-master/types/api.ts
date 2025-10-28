/**
 * Общий ответ API
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
}

/**
 * Ошибка API
 */
export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  errors?: Record<string, string[]>; // Ошибки валидации
}

/**
 * Пагинация
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Пагинированный ответ
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Сортировка
 */
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Фильтры
 */
export type FilterParams = Record<string, any>;
