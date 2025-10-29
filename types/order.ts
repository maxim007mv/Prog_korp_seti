import { DishCategory } from './dish';

/**
 * Статус заказа
 */
export type OrderStatus = 'Active' | 'Closed';

/**
 * Позиция в заказе
 */
export interface OrderItem {
  id: number;
  dishId: number;
  dishName: string;
  dishPrice: number;
  qty: number;
  itemTotal: number; // qty * dishPrice
  category: DishCategory;
  comment?: string;
}

/**
 * Заказ
 */
export interface Order {
  id: number;
  tableId: number;
  table?: {
    id: number;
    location: string;
    seats: number;
  };
  waiterId: number;
  waiter?: {
    id: number;
    name: string;
  };
  comment?: string;
  startTime: string; // ISO 8601
  endTime?: string; // ISO 8601, заполняется при закрытии
  totalPrice: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Создание заказа
 */
export interface OrderCreate {
  tableId: number;
  waiterId: number;
  bookingId?: number;
  comment?: string;
  items: {
    dishId: number;
    quantity: number;
    comment?: string;
  }[];
}

/**
 * Добавление позиций в заказ
 */
export interface OrderItemsAdd {
  items: {
    dishId: number;
    qty: number;
    comment?: string;
  }[];
}

/**
 * Обновление позиции
 */
export interface OrderItemUpdate {
  qty: number;
  comment?: string;
}

/**
 * Чек для печати
 */
export interface Receipt {
  order: Order;
  text: string; // Форматированный текст чека
  generatedAt: string;
}

/**
 * Группированные позиции по категориям (для чека)
 */
export interface ReceiptCategoryGroup {
  category: DishCategory;
  items: OrderItem[];
  subtotal: number;
}
