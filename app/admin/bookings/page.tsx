'use client';

import { useState } from 'react';
import { Calendar, Search, Filter } from 'lucide-react';
import { GlassCard, Input, Badge } from '@/components/ui';
import { useBookings } from '@/lib/hooks';
import { formatDate } from '@/lib/utils';
import type { BookingStatus } from '@/types';

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('Active');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: bookings, isLoading, error } = useBookings(statusFilter || undefined);

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
        <p className="text-red-400 font-bold">Ошибка загрузки бронирований</p>
        <p className="mt-2 text-sm text-red-300">{error.message}</p>
      </GlassCard>
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

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 rounded-[24px]">
        <h1 className="text-3xl font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">Управление бронированиями</h1>
        <p className="mt-2 text-white/70">Всего бронирований: {bookings?.length || 0}</p>
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
              placeholder="Имя клиента или телефон..."
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
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}
            >
              <option value="" className="bg-gray-800">Все статусы</option>
              <option value="Active" className="bg-gray-800">Активные</option>
              <option value="Completed" className="bg-gray-800">Завершённые</option>
              <option value="Cancelled" className="bg-gray-800">Отменённые</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {filteredBookings.length === 0 ? (
        <GlassCard className="p-8 text-center rounded-[24px]">
          <p className="text-white/70">
            {searchQuery || statusFilter ? 'Нет бронирований по заданным фильтрам' : 'Нет бронирований'}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <GlassCard key={booking.id} className="p-4 rounded-[24px]">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-amber-400" />
                    <span className="text-lg font-bold text-white">{booking.clientName}</span>
                    <Badge variant={getStatusBadgeVariant(booking.status)}>
                      {booking.status === 'Active' ? 'Активно' : booking.status === 'Completed' ? 'Завершено' : 'Отменено'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <p className="text-white/60">Столик: <span className="text-white font-medium">{booking.table?.location || 'N/A'}</span></p>
                    <p className="text-white/60">Телефон: <span className="text-white font-medium">***{booking.phoneLastFour}</span></p>
                    <p className="text-white/60">Начало: <span className="text-white font-medium">{formatDate(booking.startTime)}</span></p>
                    <p className="text-white/60">Окончание: <span className="text-white font-medium">{formatDate(booking.endTime)}</span></p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-2 rounded-xl text-sm bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-colors">
                    Детали
                  </button>
                  {booking.status === 'Active' && (
                    <button className="px-3 py-2 rounded-xl text-sm bg-red-400/20 border border-red-400/50 text-red-300 hover:bg-red-400/30 transition-colors">
                      Отменить
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
