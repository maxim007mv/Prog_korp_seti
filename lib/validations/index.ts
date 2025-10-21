import { z } from 'zod';
import { VALIDATION } from '@/constants';

/**
 * Схема валидации для создания брони
 */
export const bookingCreateSchema = z
  .object({
    clientName: z
      .string()
      .min(2, 'Имя должно содержать минимум 2 символа')
      .max(100, 'Имя слишком длинное'),
    
    phone: z
      .string()
      .regex(VALIDATION.PHONE_REGEX, 'Неверный формат телефона'),
    
    start: z.string().datetime('Укажите дату и время начала'),
    
    end: z.string().datetime('Укажите дату и время окончания'),
    
    guests: z
      .number()
      .int('Количество гостей должно быть целым числом')
      .min(1, 'Минимум 1 гость')
      .max(20, 'Максимум 20 гостей'),
    
    location: z.string().optional(),
    
    comment: z.string().max(500, 'Комментарий слишком длинный').optional(),
    
    tableId: z.number().int().positive().optional(),
  })
  .refine((data) => new Date(data.end) > new Date(data.start), {
    message: 'Время окончания должно быть позже времени начала',
    path: ['end'],
  })
  .refine((data) => new Date(data.start) > new Date(), {
    message: 'Нельзя забронировать в прошлом',
    path: ['start'],
  });

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;

/**
 * Схема валидации для поиска брони
 */
export const bookingSearchSchema = z.object({
  name: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа'),
  
  phoneSuffix: z
    .string()
    .regex(VALIDATION.PHONE_LAST_FOUR_REGEX, 'Введите 4 цифры'),
});

export type BookingSearchInput = z.infer<typeof bookingSearchSchema>;

/**
 * Схема валидации для создания/обновления блюда
 */
export const dishSchema = z.object({
  name: z
    .string()
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(100, 'Название слишком длинное'),
  
  composition: z
    .string()
    .min(5, 'Состав должен содержать минимум 5 символов')
    .max(500, 'Состав слишком длинный'),
  
  weight: z
    .string()
    .regex(VALIDATION.WEIGHT_REGEX, 'Неверный формат веса (пример: 100/20/50)'),
  
  price: z
    .number()
    .positive('Цена должна быть положительной')
    .max(100000, 'Цена слишком большая'),
  
  category: z.enum([
    'Drinks',
    'Salads',
    'Soups',
    'Mains',
    'Desserts',
    'ColdSnacks',
    'HotSnacks',
  ]),
  
  cookingTime: z
    .number()
    .int('Время приготовления должно быть целым числом')
    .min(0, 'Время приготовления не может быть отрицательным')
    .max(300, 'Время приготовления слишком большое'),
  
  tags: z.array(z.string()).default([]),
  
  imageUrl: z.string().url('Неверный формат URL').optional(),
});

export type DishInput = z.infer<typeof dishSchema>;

/**
 * Схема валидации для создания стола
 */
export const tableSchema = z.object({
  location: z
    .string()
    .min(2, 'Локация должна содержать минимум 2 символа')
    .max(50, 'Локация слишком длинная'),
  
  seats: z
    .number()
    .int('Количество мест должно быть целым числом')
    .min(1, 'Минимум 1 место')
    .max(20, 'Максимум 20 мест'),
});

export type TableInput = z.infer<typeof tableSchema>;

/**
 * Схема валидации для создания заказа
 */
export const orderCreateSchema = z.object({
  tableId: z
    .number()
    .int('ID стола должен быть целым числом')
    .positive('ID стола должен быть положительным'),
  
  waiterId: z
    .number()
    .int('ID официанта должен быть целым числом')
    .positive('ID официанта должен быть положительным'),
  
  comment: z.string().max(500, 'Комментарий слишком длинный').optional(),
});

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;

/**
 * Схема валидации для добавления позиций в заказ
 */
export const orderItemSchema = z.object({
  dishId: z
    .number()
    .int('ID блюда должен быть целым числом')
    .positive('ID блюда должен быть положительным'),
  
  qty: z
    .number()
    .int('Количество должно быть целым числом')
    .min(1, 'Минимальное количество: 1')
    .max(99, 'Максимальное количество: 99'),
  
  comment: z.string().max(200, 'Комментарий слишком длинный').optional(),
});

export const orderItemsAddSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Добавьте хотя бы одну позицию'),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type OrderItemsAddInput = z.infer<typeof orderItemsAddSchema>;
