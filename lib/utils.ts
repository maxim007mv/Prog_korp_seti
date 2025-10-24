import { type ClassValue, clsx } from 'clsx';

/**
 * Объединение классов Tailwind с поддержкой условий
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Форматирование цены
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Форматирование даты
 */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'time') {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }
  
  if (format === 'long') {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }
  
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Маскирование телефона
 */
export function maskPhone(phone: string): string {
  if (phone.length < 4) return phone;
  const lastFour = phone.slice(-4);
  const masked = '*'.repeat(phone.length - 4);
  return masked + lastFour;
}

/**
 * Получение последних 4 цифр телефона
 */
export function getPhoneLastFour(phone: string): string {
  return phone.replace(/\D/g, '').slice(-4);
}

/**
 * Форматирование времени приготовления
 */
export function formatCookingTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} мин`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
}

/**
 * Расчёт общей суммы позиций заказа
 */
export function calculateOrderTotal(items: { qty: number; itemTotal: number }[]): number {
  return items.reduce((sum, item) => sum + item.itemTotal, 0);
}

/**
 * Валидация формата веса блюда
 */
export function isValidWeight(weight: string): boolean {
  return /^\d+(\/\d+)*$/.test(weight);
}

/**
 * Генерация случайного ID (для временных данных)
 */
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Дебаунс функции
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Проверка, является ли дата сегодняшней
 */
export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Форматирование диапазона дат
 */
export function formatDateRange(start: string | Date, end: string | Date): string {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  
  const startStr = formatDate(startDate, 'short');
  const endStr = formatDate(endDate, 'short');
  
  if (startStr === endStr) {
    return `${startStr} ${formatDate(startDate, 'time')} - ${formatDate(endDate, 'time')}`;
  }
  
  return `${startStr} ${formatDate(startDate, 'time')} - ${endStr} ${formatDate(endDate, 'time')}`;
}
