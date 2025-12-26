import { DishCategory } from '@/types';

/**
 * Список всех категорий блюд
 */
export const DISH_CATEGORIES: DishCategory[] = [
  'Напитки',
  'Салаты',
  'Холодные закуски',
  'Горячие закуски',
  'Супы',
  'Горячие блюда',
  'Десерты',
];

/**
 * Локализованные названия категорий (теперь совпадают с ключами)
 */
export const CATEGORY_LABELS: Record<DishCategory, string> = {
  'Напитки': 'Напитки',
  'Холодные закуски': 'Холодные закуски',
  'Горячие закуски': 'Горячие закуски',
  'Салаты': 'Салаты',
  'Супы': 'Супы',
  'Горячие блюда': 'Горячие блюда',
  'Десерты': 'Десерты',
};

/**
 * Популярные теги блюд
 */
export const DISH_TAGS = [
  'веган',
  'вегетарианское',
  'острое',
  'халяль',
  'кошер',
  'без глютена',
  'без лактозы',
  'низкокалорийное',
  'детское',
  'острота 1',
  'острота 2',
  'острота 3',
  'фирменное',
  'новинка',
  'хит',
] as const;

/**
 * Минимальное и максимальное время бронирования (в минутах)
 */
export const BOOKING_DURATION = {
  MIN: 30,
  MAX: 240,
  DEFAULT: 120,
  STEP: 30,
} as const;

/**
 * Форматы валидации
 */
export const VALIDATION = {
  PHONE_REGEX: /^\+?[0-9]{10,15}$/,
  WEIGHT_REGEX: /^\d+(\/\d+)*$/,
  PHONE_LAST_FOUR_REGEX: /^\d{4}$/,
} as const;

/**
 * Роли пользователей
 */
export const USER_ROLES = {
  CLIENT: 'client',
  WAITER: 'waiter',
  ADMIN: 'admin',
} as const;

/**
 * Статусы
 */
export const STATUS = {
  BOOKING: {
    ACTIVE: 'Active',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed',
  },
  ORDER: {
    ACTIVE: 'Active',
    CLOSED: 'Closed',
  },
} as const;
