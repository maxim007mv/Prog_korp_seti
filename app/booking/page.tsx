'use client';

import { BookingForm } from '@/components/features/booking';

export default function BookingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Бронирование столика</h1>
        <p className="mt-2 text-gray-600">
          Выберите дату, время и количество гостей
        </p>
      </div>

      <BookingForm />
    </div>
  );
}
