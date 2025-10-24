'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, MapPin, Users as UsersIcon } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useTables } from '@/lib/hooks';
import type { Table } from '@/types';

export default function AdminTablesPage() {
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const { data: tables, isLoading, error } = useTables();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Управление столами</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-red-600">Ошибка загрузки столов</p>
          <p className="mt-2 text-sm text-red-500">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление столами</h1>
          <p className="mt-2 text-gray-600">
            Всего столов: {tables?.length || 0}
          </p>
        </div>
        <Button variant="primary">
          <Plus className="mr-2 h-5 w-5" />
          Добавить стол
        </Button>
      </div>

      {/* Список столов */}
      {!tables || tables.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600">Нет столов</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables.map((table) => (
            <Card key={table.id}>
              <div className="mb-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Стол #{table.id}</h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{table.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <UsersIcon className="h-4 w-4" />
                    <span>{table.seats} мест</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditingTable(table)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Изменить
                </Button>
                <Button
                  variant="outline"
                  onClick={() => alert('Удаление стола')}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
