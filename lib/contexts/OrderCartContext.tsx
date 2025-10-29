'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Dish } from '@/types';

export interface CartItem {
  dish: Dish;
  quantity: number;
  comment?: string;
}

interface OrderCartContextType {
  items: CartItem[];
  bookingId: number | null;
  tableId: number | null;
  setBookingInfo: (bookingId: number, tableId: number) => void;
  addItem: (dish: Dish, quantity?: number) => void;
  removeItem: (dishId: number) => void;
  updateQuantity: (dishId: number, quantity: number) => void;
  updateComment: (dishId: number, comment: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const OrderCartContext = createContext<OrderCartContextType | undefined>(undefined);

export function OrderCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [tableId, setTableId] = useState<number | null>(null);

  const setBookingInfo = (newBookingId: number, newTableId: number) => {
    setBookingId(newBookingId);
    setTableId(newTableId);
  };

  const addItem = (dish: Dish, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { dish, quantity, comment: undefined }];
    });
  };

  const removeItem = (dishId: number) => {
    setItems((prev) => prev.filter((item) => item.dish.id !== dishId));
  };

  const updateQuantity = (dishId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(dishId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.dish.id === dishId ? { ...item, quantity } : item
      )
    );
  };

  const updateComment = (dishId: number, comment: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.dish.id === dishId ? { ...item, comment } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.dish.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <OrderCartContext.Provider
      value={{
        items,
        bookingId,
        tableId,
        setBookingInfo,
        addItem,
        removeItem,
        updateQuantity,
        updateComment,
        clearCart,
        getTotalPrice,
        getItemCount,
      }}
    >
      {children}
    </OrderCartContext.Provider>
  );
}

export function useOrderCart() {
  const context = useContext(OrderCartContext);
  if (!context) {
    throw new Error('useOrderCart must be used within OrderCartProvider');
  }
  return context;
}
