/**
 * Категории блюд
 */
export type DishCategory =
  | 'Drinks'
  | 'Salads'
  | 'Soups'
  | 'Mains'
  | 'Desserts'
  | 'ColdSnacks'
  | 'HotSnacks';

/**
 * Блюдо в меню
 */
export interface Dish {
  id: number;
  name: string;
  composition: string; // Состав
  weight: string; // Формат: 100/20/50
  price: number;
  category: DishCategory;
  cookingTime: number; // Время приготовления в минутах
  tags: string[]; // Теги: веган, острое, халяль, кошер и т.д.
  imageUrl?: string;
}

/**
 * Создание/обновление блюда
 */
export interface DishInput {
  name: string;
  composition: string;
  weight: string;
  price: number;
  category: DishCategory;
  cookingTime: number;
  tags: string[];
  imageUrl?: string;
}

/**
 * Меню с категориями
 */
export interface MenuData {
  categories: DishCategory[];
  dishes: Dish[];
}
