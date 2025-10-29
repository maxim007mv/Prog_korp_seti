'use client';

import { useMemo } from 'react';
import { formatPrice, formatDate } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/constants';
import type { Receipt, ReceiptCategoryGroup, DishCategory } from '@/types';

interface ReceiptViewProps {
  receipt: Receipt;
}

export function ReceiptView({ receipt }: ReceiptViewProps) {
  const { order } = receipt;

  // Группировка позиций по категориям (ПЗ-4)
  const groupedItems = useMemo(() => {
    const groups: Record<DishCategory, ReceiptCategoryGroup> = {} as any;

    order.items?.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = {
          category: item.category,
          items: [],
          subtotal: 0,
        };
      }
      groups[item.category].items.push(item);
      groups[item.category].subtotal += item.itemTotal;
    });

    return Object.values(groups);
  }, [order.items]);

  return (
    <div className="mx-auto max-w-2xl bg-white p-8 font-mono text-sm">
      {/* Шапка чека */}
      <div className="mb-6 border-b-2 border-dashed border-gray-300 pb-4 text-center">
        <h1 className="mb-2 text-2xl font-bold">РЕСТОРАН</h1>
        <p className="text-gray-600">Чек #{order.id}</p>
      </div>

      {/* Информация о заказе */}
      <div className="mb-6 space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-600">Столик:</span>
          <span className="font-semibold">
            #{order.table?.id} ({order.table?.location})
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Официант:</span>
          <span className="font-semibold">{order.waiter?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Период обслуживания:</span>
          <span className="font-semibold">
            {formatDate(order.startTime, 'time')}
            {order.endTime && ' - ' + formatDate(order.endTime, 'time')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Дата:</span>
          <span className="font-semibold">{formatDate(order.startTime, 'short')}</span>
        </div>
      </div>

      {/* Позиции по категориям (ПЗ-4) */}
      <div className="mb-6">
        {groupedItems.map((group) => (
          <div key={group.category} className="mb-4">
            <h3 className="mb-2 font-bold uppercase">
              {CATEGORY_LABELS[group.category]}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.dishName} x{item.qty}
                  </span>
                  <span>{formatPrice(item.itemTotal)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between border-t border-gray-300 pt-1 font-semibold">
              <span>Подитог {CATEGORY_LABELS[group.category]}:</span>
              <span>{formatPrice(group.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Итоговая сумма */}
      <div className="border-t-2 border-dashed border-gray-300 pt-4">
        <div className="flex justify-between text-xl font-bold">
          <span>ИТОГО:</span>
          <span>{formatPrice(order.totalPrice)}</span>
        </div>
      </div>

      {/* Футер */}
      <div className="mt-6 border-t border-gray-300 pt-4 text-center text-xs text-gray-500">
        <p>Спасибо за посещение!</p>
        <p>Будем рады видеть вас снова</p>
      </div>
    </div>
  );
}
