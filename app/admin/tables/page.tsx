'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, MapPin, Users as UsersIcon } from 'lucide-react';
import { GlassCard, Badge } from '@/components/ui';
import { useTables } from '@/lib/hooks';
import type { Table } from '@/types';

export default function AdminTablesPage() {
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const { data: tables, isLoading, error } = useTables();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-[24px] bg-white/5 backdrop-blur" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-8 text-center rounded-[24px]">
        <p className="text-red-400 font-bold">Ошибка загрузки столов</p>
        <p className="mt-2 text-sm text-red-300">{error.message}</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 rounded-[24px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">Управление столами</h1>
            <p className="mt-2 text-white/70">Всего столов: {tables?.length || 0}</p>
          </div>
          <button className="px-4 py-2 rounded-xl text-sm bg-amber-400/30 border border-amber-400/50 text-amber-300 hover:bg-amber-400/40 transition-colors flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Добавить стол
          </button>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tables?.map((table) => (
          <GlassCard key={table.id} className="p-6 rounded-[24px]">
            <div className="mb-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-amber-400" />
                  {table.location}
                </h3>
                <div
                  className={\`h-3 w-3 rounded-full \${table.isActive ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-gray-500'}\`}
                  title={table.isActive ? 'Доступен' : 'Недоступен'}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/70">
                  <UsersIcon className="h-4 w-4" />
                  <span>Вместимость: <span className="text-white font-semibold">{table.seats} мест</span></span>
                </div>
                <div className="flex gap-2">
                  <Badge variant={table.isActive ? 'success' : 'default'}>
                    {table.isActive ? 'Активный' : 'Неактивный'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 rounded-xl text-sm bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                <Edit className="h-4 w-4" />
                Изменить
              </button>
              <button className="flex-1 px-3 py-2 rounded-xl text-sm bg-red-400/20 border border-red-400/50 text-red-300 hover:bg-red-400/30 transition-colors flex items-center justify-center gap-2">
                <Trash2 className="h-4 w-4" />
                Удалить
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
