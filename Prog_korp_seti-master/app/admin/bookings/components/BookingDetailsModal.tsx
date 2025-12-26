'use client';

import { X, Calendar, Clock, Users, Phone, MapPin, MessageSquare } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Booking } from '@/types';

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
}

export default function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
  const duration = booking.start && booking.end 
    ? Math.round((new Date(booking.end).getTime() - new Date(booking.start).getTime()) / (1000 * 60 * 60))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/10 shadow-2xl">
        {/* Заголовок */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-gray-900/95 backdrop-blur p-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Детали бронирования</h2>
            <p className="mt-1 text-sm text-white/60">ID: #{booking.id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Содержимое */}
        <div className="p-6 space-y-6">
          {/* Статус */}
          <div className="flex items-center justify-between">
            <span className="text-white/60">Статус бронирования:</span>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              booking.status === 'Active' 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                : booking.status === 'Completed'
                ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                : 'bg-red-500/20 text-red-300 border border-red-500/50'
            }`}>
              {booking.status === 'Active' ? 'Активно' : booking.status === 'Completed' ? 'Завершено' : 'Отменено'}
            </span>
          </div>

          <div className="h-px bg-white/10" />

          {/* Информация о клиенте */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Информация о клиенте
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <Users className="h-5 w-5 text-white/60 flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/50">Имя клиента</p>
                  <p className="text-white font-medium">{booking.clientName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <Phone className="h-5 w-5 text-white/60 flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/50">Телефон</p>
                  <p className="text-white font-medium">
                    {booking.clientPhone || `***${booking.phoneLastFour}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Информация о бронировании */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Детали бронирования
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <MapPin className="h-5 w-5 text-white/60 flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/50">Столик</p>
                  <p className="text-white font-medium">
                    {booking.table?.location || `Стол #${booking.tableId}`}
                    {booking.table?.seats && <span className="text-white/60"> • {booking.table.seats} мест</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <Calendar className="h-5 w-5 text-white/60 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-white/50">Дата и время начала</p>
                  <p className="text-white font-medium">{formatDate(booking.start)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <Calendar className="h-5 w-5 text-white/60 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-white/50">Дата и время окончания</p>
                  <p className="text-white font-medium">{formatDate(booking.end)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <Clock className="h-5 w-5 text-white/60 flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/50">Длительность</p>
                  <p className="text-white font-medium">{duration} {duration === 1 ? 'час' : duration < 5 ? 'часа' : 'часов'}</p>
                </div>
              </div>
              {booking.guestCount && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <Users className="h-5 w-5 text-white/60 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-white/50">Количество гостей</p>
                    <p className="text-white font-medium">{booking.guestCount}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Комментарий (если есть) */}
          {booking.comment && (
            <>
              <div className="h-px bg-white/10" />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Комментарий
                </h3>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/80">{booking.comment}</p>
                </div>
              </div>
            </>
          )}

          {/* Временные метки */}
          <div className="h-px bg-white/10" />
          <div className="grid grid-cols-2 gap-4 text-xs text-white/50">
            <div>
              <p>Создано</p>
              <p className="text-white/70 mt-1">{formatDate(booking.createdAt || booking.start)}</p>
            </div>
            {booking.updatedAt && (
              <div>
                <p>Обновлено</p>
                <p className="text-white/70 mt-1">{formatDate(booking.updatedAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Футер */}
        <div className="sticky bottom-0 border-t border-white/10 bg-gray-900/95 backdrop-blur p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl bg-amber-400 text-black font-semibold hover:bg-amber-300 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
