'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Check } from 'lucide-react';
import { Button } from '@/components/ui';
import { useOrder, useCloseOrder, useMenu } from '@/lib/hooks';
import { AiUpsellPanel } from '@/components/features/orders/AiUpsellPanel';

export default function StaffOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);

  const { data: order, isLoading, error } = useOrder(orderId);
  const { data: menuData } = useMenu(); // Для AI рекомендаций
  const closeOrderMutation = useCloseOrder();

  const handleCloseOrder = async () => {
    if (!order || !confirm('Закрыть заказ? Это действие нельзя отменить.')) {
      return;
    }

    try {
      await closeOrderMutation.mutateAsync(orderId);
      alert('Заказ успешно закрыт!');
      router.push('/staff');
    } catch (err: any) {
      alert(`Ошибка: ${err.message}`);
    }
  };

  const handlePrintReceipt = () => {
    router.push(`/staff/receipt/${orderId}/print`);
  };

  const handleAddDishFromAi = (dishId: number) => {
    // TODO: Реализовать добавление блюда в заказ через API
    alert(`Добавление блюда #${dishId} в заказ (требуется API)`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-red-600">Ошибка загрузки заказа</p>
          {error && <p className="mt-2 text-sm text-red-500">{error.message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-5 w-5" />
          Назад
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrintReceipt}>
            <Printer className="mr-2 h-5 w-5" />
            Печать чека
          </Button>
          {order.status === 'Active' && (
            <Button
              variant="primary"
              onClick={handleCloseOrder}
              disabled={closeOrderMutation.isPending}
            >
              <Check className="mr-2 h-5 w-5" />
              {closeOrderMutation.isPending ? 'Закрытие...' : 'Закрыть заказ'}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-bold">
          Заказ #{order.id} - Стол #{order.table?.id}
        </h1>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-600">Столик</p>
            <p className="font-semibold">
              #{order.table?.id} - {order.table?.location}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Официант</p>
            <p className="font-semibold">{order.waiter?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Открыт</p>
            <p className="font-semibold">
              {new Date(order.startTime).toLocaleString('ru-RU')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Статус</p>
            <p className="font-semibold">
              {order.status === 'Active' ? 'Активный' : 'Закрыт'}
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="mb-4 text-lg font-bold">Позиции заказа</h2>
          {order.items && order.items.length > 0 ? (
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.dishName}</p>
                    <p className="text-sm text-gray-600">
                      {item.qty} x {(item.itemTotal / item.qty).toFixed(2)} ₽
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.itemTotal.toFixed(2)} ₽</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Нет позиций в заказе</p>
          )}

          <div className="mt-6 flex justify-between border-t pt-4">
            <span className="text-lg font-bold">ИТОГО:</span>
            <span className="text-lg font-bold text-accent">
              {order.totalPrice.toFixed(2)} ₽
            </span>
          </div>
        </div>
      </div>

      {/* AI Upsell панель - только для активных заказов */}
      {order.status === 'Active' && menuData?.dishes && (
        <div className="mt-6">
          <AiUpsellPanel
            order={order}
            allDishes={menuData.dishes}
            onAddDish={handleAddDishFromAi}
          />
        </div>
      )}
    </div>
  );
}
