'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { OrderCard } from '@/components/features/orders';
import { useOrders } from '@/lib/hooks';
import type { Order } from '@/types';

export default function StaffPage() {
  const [showClosed, setShowClosed] = useState(false);
  const { data: ordersData, isLoading, error } = useOrders({ status: showClosed ? undefined : 'Active' });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Заказы</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-red-600">Ошибка загрузки заказов</p>
          <p className="mt-2 text-sm text-red-500">{error.message}</p>
        </div>
      </div>
    );
  }

  const orders = ordersData || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Заказы</h1>
        <div className="flex gap-3">
          <Button
            variant={showClosed ? 'outline' : 'primary'}
            onClick={() => setShowClosed(false)}
          >
            Активные
          </Button>
          <Button
            variant={showClosed ? 'primary' : 'outline'}
            onClick={() => setShowClosed(true)}
          >
            Все
          </Button>
          <Button variant="primary">
            <Plus className="mr-2 h-5 w-5" />
            Новый заказ
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-12 text-center">
          <p className="text-lg text-gray-600">
            {showClosed ? 'Нет заказов' : 'Нет активных заказов'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {!showClosed && 'Создайте новый заказ для начала работы'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order: Order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
