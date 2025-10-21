'use client';

import Link from 'next/link';
import { Clock, DollarSign, ChevronRight } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order } from '@/types';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const duration = order.startTime
    ? Math.floor(
        (new Date().getTime() - new Date(order.startTime).getTime()) / 1000 / 60
      )
    : 0;

  return (
    <Link href={`/staff/orders/${order.id}`}>
      <Card hoverable className="relative">
        <div className="absolute top-4 right-4">
          <Badge variant={order.status === 'Active' ? 'info' : 'success'}>
            {order.status === 'Active' ? 'Активный' : 'Закрыт'}
          </Badge>
        </div>

        <div className="pr-24">
          <div className="mb-3">
            <h3 className="text-xl font-semibold">
              Стол #{order.table?.id} - {order.table?.location}
            </h3>
            <p className="text-sm text-gray-600">
              Официант: {order.waiter?.name}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                Открыт: {formatDate(order.startTime, 'time')}
                {order.status === 'Active' && ` (${duration} мин)`}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span className="text-lg font-bold text-accent">
                {formatPrice(order.totalPrice)}
              </span>
            </div>

            <div className="text-gray-600">
              Позиций: {order.items?.length || 0}
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 right-4">
          <ChevronRight className="h-6 w-6 text-gray-400" />
        </div>
      </Card>
    </Link>
  );
}
