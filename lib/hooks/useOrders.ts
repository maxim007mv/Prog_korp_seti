'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import type { OrderCreate, OrderItemsAdd, OrderItemUpdate } from '@/types';

/**
 * Хук для получения всех заказов
 */
export function useOrders(params?: { status?: string; waiterId?: number }) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.getOrders(params),
  });
}

/**
 * Хук для получения заказа по ID
 */
export function useOrder(id: number) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrder(id),
    enabled: !!id,
    // Более частое обновление для активных заказов
    refetchInterval: (query) => {
      const order = query.state.data;
      return order?.status === 'Active' ? 10 * 1000 : false; // 10 секунд для активных
    },
  });
}

/**
 * Хук для создания заказа
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

/**
 * Хук для добавления позиций в заказ
 */
export function useAddOrderItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: number; data: OrderItemsAdd }) =>
      ordersApi.addOrderItems(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

/**
 * Хук для обновления позиции в заказе
 */
export function useUpdateOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      itemId,
      data,
    }: {
      orderId: number;
      itemId: number;
      data: OrderItemUpdate;
    }) => ordersApi.updateOrderItem(orderId, itemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

/**
 * Хук для удаления позиции из заказа
 */
export function useDeleteOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: number; itemId: number }) =>
      ordersApi.deleteOrderItem(orderId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

/**
 * Хук для закрытия заказа
 */
export function useCloseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.closeOrder,
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

/**
 * Хук для получения чека
 */
export function useReceipt(orderId: number) {
  return useQuery({
    queryKey: ['receipt', orderId],
    queryFn: () => ordersApi.getReceipt(orderId),
    enabled: !!orderId,
  });
}
