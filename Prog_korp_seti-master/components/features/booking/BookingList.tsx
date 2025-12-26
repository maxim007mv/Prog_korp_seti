'use client';

import { Calendar, Clock, X } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { formatDate, formatDateRange } from '@/lib/utils';
import type { Booking } from '@/types';

interface BookingListProps {
  bookings: Booking[];
  onCancel: (id: number) => void;
}

export function BookingList({ bookings, onCancel }: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <Card className="text-center p-12">
        <p className="text-gray-600">Бронирования не найдены</p>
      </Card>
    );
  }

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'Active':
        return <Badge variant="success">Активная</Badge>;
      case 'Cancelled':
        return <Badge variant="error">Отменена</Badge>;
      case 'Completed':
        return <Badge variant="default">Завершена</Badge>;
    }
  };

  const canCancel = (booking: Booking) => {
    return booking.status === 'Active' && new Date(booking.start) > new Date();
  };

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="relative">
          <div className="absolute top-4 right-4">
            {getStatusBadge(booking.status)}
          </div>

          <div className="pr-24">
            <h3 className="text-lg font-semibold mb-2">
              Стол #{booking.table?.id} - {booking.table?.location}
            </h3>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDateRange(booking.start, booking.end)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {formatDate(booking.start, 'time')} -{' '}
                  {formatDate(booking.end, 'time')}
                </span>
              </div>
            </div>

            {booking.comment && (
              <p className="mt-3 text-sm text-gray-600 italic">
                {booking.comment}
              </p>
            )}
          </div>

          {canCancel(booking) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => onCancel(booking.id)}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
                Отменить бронь
              </button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
