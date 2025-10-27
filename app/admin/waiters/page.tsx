'use client';

import { Plus, Edit, UserX } from 'lucide-react';
import { GlassCard, Badge } from '@/components/ui';

// Временные моковые данные (нужно добавить хуки для официантов)
const MOCK_WAITERS = [
  { id: 1, name: 'Иван Иванов', isActive: true, ordersToday: 15, totalRevenue: 45000 },
  { id: 2, name: 'Мария Петрова', isActive: true, ordersToday: 12, totalRevenue: 38000 },
  { id: 3, name: 'Алексей Сидоров', isActive: false, ordersToday: 0, totalRevenue: 0 },
  { id: 4, name: 'Елена Кузнецова', isActive: true, ordersToday: 18, totalRevenue: 52000 },
];

export default function AdminWaitersPage() {
  return (
    <div className="space-y-6">
      <GlassCard className="p-6 rounded-[24px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">Управление официантами</h1>
            <p className="mt-2 text-white/70">Всего официантов: {MOCK_WAITERS.length}</p>
          </div>
          <button className="px-4 py-2 rounded-xl text-sm bg-amber-400/30 border border-amber-400/50 text-amber-300 hover:bg-amber-400/40 transition-colors flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Добавить официанта
          </button>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_WAITERS.map((waiter) => (
          <GlassCard key={waiter.id} className="p-6 rounded-[24px]">
            <div className="mb-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{waiter.name}</h3>
                <div
                  className={\`h-3 w-3 rounded-full \${waiter.isActive ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-gray-500'}\`}
                  title={waiter.isActive ? 'Активен' : 'Неактивен'}
                />
              </div>
              <div className="space-y-2 mb-3">
                <p className="text-sm text-white/60">ID: <span className="text-white">{waiter.id}</span></p>
                <Badge variant={waiter.isActive ? 'success' : 'default'}>
                  {waiter.isActive ? 'Активен' : 'Неактивен'}
                </Badge>
              </div>
              {waiter.isActive && (
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Заказов сегодня</p>
                    <p className="text-xl font-bold text-amber-400">{waiter.ordersToday}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Выручка</p>
                    <p className="text-xl font-bold text-green-400">{waiter.totalRevenue.toLocaleString('ru-RU')} ₽</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 rounded-xl text-sm bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                <Edit className="h-4 w-4" />
                Изменить
              </button>
              <button className="flex-1 px-3 py-2 rounded-xl text-sm bg-red-400/20 border border-red-400/50 text-red-300 hover:bg-red-400/30 transition-colors flex items-center justify-center gap-2">
                <UserX className="h-4 w-4" />
                Удалить
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
