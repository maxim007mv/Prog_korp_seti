'use client';

import { useState } from 'react';
import { Calendar, Search, Filter } from 'lucide-react';
import { Button, Input, Card, Badge } from '@/components/ui';
import { useBookings } from '@/lib/hooks';
import { formatDate } from '@/lib/utils';
import type { BookingStatus } from '@/types';

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('Active');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: bookings, isLoading, error } = useBookings(statusFilter || undefined);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Управление бронированиями</h1>
        </div>
        <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-red-600">Ошибка загрузки бронирований</p>
          <p className="mt-2 text-sm text-red-500">{error.message}</p>
        </div>
      </div>
    );
  }

  const filteredBookings = bookings?.filter((booking) => {
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    const matchesSearch = booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.phoneLastFour.includes(searchQuery);
    return matchesStatus && matchesSearch;
  }) || [];

  const getStatusBadgeVariant = (status: BookingStatus) => {
    switch (status) {
      case 'Active': return 'info';
      case 'Cancelled': return 'error';
      case 'Completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'Active': return 'Активно';
      case 'Cancelled': return 'Отменено';
      case 'Completed': return 'Завершено';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Управление бронированиями</h1>
        <p className="mt-2 text-gray-600">
          Всего бронирований: {bookings?.length || 0}
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
              placeholder="Имя или телефон..."
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
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}
            >
              <option value="">Все статусы</option>
              <option value="Active">Активные</option>
              <option value="Completed">Завершённые</option>
              <option value="Cancelled">Отменённые</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Таблица бронирований */}
      {filteredBookings.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600">
            {searchQuery || statusFilter
              ? 'Нет бронирований по заданным фильтрам'
              : 'Нет бронирований'}
          </p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-600">ID</th>
                  <th className="pb-3 font-medium text-gray-600">Клиент</th>
                  <th className="pb-3 font-medium text-gray-600">Телефон</th>
                  <th className="pb-3 font-medium text-gray-600">Столик</th>
                  <th className="pb-3 font-medium text-gray-600">Период</th>
                  <th className="pb-3 font-medium text-gray-600">Статус</th>
                  <th className="pb-3 font-medium text-gray-600">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b last:border-0">
                    <td className="py-3">#{booking.id}</td>
                    <td className="py-3 font-medium">{booking.clientName}</td>
                    <td className="py-3 text-gray-600">
                      {booking.phoneMasked}
                    </td>
                    <td className="py-3">
                      Стол #{booking.table?.id}
                      <div className="text-xs text-gray-500">
                        {booking.table?.location}
                      </div>
                    </td>
                    <td className="py-3 text-sm">
                      <div>{formatDate(booking.start, 'short')}</div>
                      <div className="text-gray-500">
                        {formatDate(booking.start, 'time')} - {formatDate(booking.end, 'time')}
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Просмотр
                        </Button>
                        {booking.status === 'Active' && (
                          <Button variant="outline" size="sm">
                            Отменить
                          </Button>
                        )}
                      </div>
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
