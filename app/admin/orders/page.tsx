'use client';

import { useState } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlassCard, Input, Badge } from '@/components/ui';
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
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-[24px] bg-white/5 backdrop-blur" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-8 text-center rounded-[24px]">
        <p className="text-red-400 font-bold">Ошибка загрузки заказов</p>
        <p className="mt-2 text-sm text-red-300">{error.message}</p>
      </GlassCard>
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
    <div className="space-y-6">
      <GlassCard className="p-6 rounded-[24px]">
        <h1 className="text-3xl font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">Журнал заказов</h1>
        <p className="mt-2 text-white/70">Всего заказов: {orders?.length || 0}</p>
      </GlassCard>

      <GlassCard className="p-6 rounded-[24px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
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
            <label className="mb-2 block text-sm font-medium text-white/80">
              <Filter className="mr-2 inline h-4 w-4" />
              Статус
            </label>
            <select
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-white/90 focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
            >
              <option value="" className="bg-gray-800">Все статусы</option>
              <option value="Active" className="bg-gray-800">Активные</option>
              <option value="Closed" className="bg-gray-800">Закрытые</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {filteredOrders.length === 0 ? (
        <GlassCard className="p-8 text-center rounded-[24px]">
          <p className="text-white/70">
            {searchQuery || statusFilter ? 'Нет заказов по заданным фильтрам' : 'Нет заказов'}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <GlassCard key={order.id} className="p-4 rounded-[24px]">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl font-bold text-white">#{order.id}</span>
                    <Badge variant={order.status === 'Active' ? 'info' : 'success'}>
                      {order.status === 'Active' ? 'Активный' : 'Закрыт'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <p className="text-white/60">Столик: <span className="text-white font-medium">{order.table?.location || 'N/A'}</span></p>
                    <p className="text-white/60">Официант: <span className="text-white font-medium">{order.waiter?.name || 'N/A'}</span></p>
                    <p className="text-white/60">Создан: <span className="text-white font-medium">{formatDate(order.createdAt)}</span></p>
                    <p className="text-white/60">Сумма: <span className="text-amber-400 font-bold">{formatPrice(order.totalPrice)}</span></p>
                  </div>
                </div>
                <button 
                  className="px-4 py-2 rounded-xl text-sm bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-colors flex items-center gap-2"
                  onClick={() => router.push(\`/staff/orders/\${order.id}\`)}
                >
                  <Eye className="h-4 w-4" />
                  Детали
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
