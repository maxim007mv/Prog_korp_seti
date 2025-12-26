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

/**
 * Схема валидации для входа
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Неверный формат email')
    .min(1, 'Email обязателен'),
  
  password: z
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .max(100, 'Пароль слишком длинный'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Базовая схема валидации для регистрации
 */
export const registerBaseSchema = z.object({
  name: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(100, 'Имя слишком длинное'),
  
  email: z
    .string()
    .email('Неверный формат email')
    .min(1, 'Email обязателен'),
  
  password: z
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .max(100, 'Пароль слишком длинный')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Пароль должен содержать заглавные и строчные буквы, и цифры'
    ),
  
  passwordConfirm: z
    .string()
    .min(1, 'Подтверждение пароля обязательно'),
  
  role: z.enum(['client', 'waiter', 'admin'], {
    errorMap: () => ({ message: 'Выберите роль' }),
  }),
  
  phone: z
    .string()
    .regex(VALIDATION.PHONE_REGEX, 'Неверный формат телефона')
    .optional(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Пароли не совпадают',
  path: ['passwordConfirm'],
});

/**
 * Схема валидации для регистрации официанта (телефон обязателен)
 */
export const registerWaiterSchema = registerBaseSchema.refine(
  (data) => data.role !== 'waiter' || (data.phone && data.phone.length > 0),
  {
    message: 'Телефон обязателен для официантов',
    path: ['phone'],
  }
);

export type RegisterInput = z.infer<typeof registerWaiterSchema>;
