/**
 * Стол в ресторане
 */
export interface Table {
  id: number;
  location: string; // Локация/зал
  seats: number; // Количество мест
}

/**
 * Создание/обновление стола
 */
export interface TableInput {
  location: string;
  seats: number;
}

/**
 * Доступность стола (для поиска свободных столов)
 */
export interface TableAvailability extends Table {
  isAvailable: boolean;
  nextAvailableTime?: string;
}
