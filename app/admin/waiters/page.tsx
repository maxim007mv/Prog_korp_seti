'use client';

import { Plus, Edit, UserX } from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Временные моковые данные (нужно добавить хуки для официантов)
const MOCK_WAITERS = [
  { id: 1, name: 'Иван Иванов', isActive: true },
  { id: 2, name: 'Мария Петрова', isActive: true },
  { id: 3, name: 'Алексей Сидоров', isActive: false },
];

export default function AdminWaitersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление официантами</h1>
          <p className="mt-2 text-gray-600">
            Всего официантов: {MOCK_WAITERS.length}
          </p>
        </div>
        <Button variant="primary">
          <Plus className="mr-2 h-5 w-5" />
          Добавить официанта
        </Button>
      </div>

      {/* Список официантов */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_WAITERS.map((waiter) => (
          <Card key={waiter.id}>
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-bold">{waiter.name}</h3>
                <div
                  className={`h-3 w-3 rounded-full ${
                    waiter.isActive ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                  title={waiter.isActive ? 'Активен' : 'Неактивен'}
                />
              </div>
              <p className="text-sm text-gray-600">ID: {waiter.id}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Edit className="mr-2 h-4 w-4" />
                Изменить
              </Button>
              <Button
                variant="outline"
                onClick={() => alert(`${waiter.isActive ? 'Деактивировать' : 'Активировать'} ${waiter.name}`)}
              >
                <UserX className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
