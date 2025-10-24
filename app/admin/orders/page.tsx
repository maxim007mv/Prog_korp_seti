'use client';

import { useState } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Badge } from '@/components/ui';
import { useOrders } from '@/lib/hooks';
import { formatDate, formatPrice } from '@/lib/utils';
import type { OrderStatus } from '@/types';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: orders, isLoading, error } = useOrders({});

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Журнал заказов</h1>
        </div>
        <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
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

  const filteredOrders = orders?.filter((order) => {
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesSearch = 
      order.id.toString().includes(searchQuery) ||
      order.waiter?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.table?.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Журнал заказов</h1>
        <p className="mt-2 text-gray-600">
          Всего заказов: {orders?.length || 0}
        </p>
      </div>

      {/* Фильтры */}
      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              <Search className="mr-2 inline h-4 w-4" />
              Поиск
            </label>
            <Input
              type="text"
              placeholder="ID, официант, столик..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              <Filter className="mr-2 inline h-4 w-4" />
              Статус
            </label>
            <select
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
            >
              <option value="">Все статусы</option>
              <option value="Active">Активные</option>
              <option value="Closed">Закрытые</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Таблица заказов */}
      {filteredOrders.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600">
            {searchQuery || statusFilter
              ? 'Нет заказов по заданным фильтрам'
              : 'Нет заказов'}
          </p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-600">ID</th>
                  <th className="pb-3 font-medium text-gray-600">Столик</th>
                  <th className="pb-3 font-medium text-gray-600">Официант</th>
                  <th className="pb-3 font-medium text-gray-600">Открыт</th>
                  <th className="pb-3 font-medium text-gray-600">Закрыт</th>
                  <th className="pb-3 font-medium text-gray-600">Сумма</th>
                  <th className="pb-3 font-medium text-gray-600">Статус</th>
                  <th className="pb-3 font-medium text-gray-600">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3">#{order.id}</td>
                    <td className="py-3">
                      Стол #{order.table?.id}
                      <div className="text-xs text-gray-500">
                        {order.table?.location}
                      </div>
                    </td>
                    <td className="py-3">{order.waiter?.name}</td>
                    <td className="py-3 text-sm">
                      {formatDate(order.startTime, 'short')}
                      <div className="text-xs text-gray-500">
                        {formatDate(order.startTime, 'time')}
                      </div>
                    </td>
                    <td className="py-3 text-sm">
                      {order.endTime ? (
                        <>
                          {formatDate(order.endTime, 'short')}
                          <div className="text-xs text-gray-500">
                            {formatDate(order.endTime, 'time')}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 font-semibold text-accent">
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td className="py-3">
                      <Badge variant={order.status === 'Active' ? 'info' : 'success'}>
                        {order.status === 'Active' ? 'Активный' : 'Закрыт'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/staff/orders/${order.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Просмотр
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
