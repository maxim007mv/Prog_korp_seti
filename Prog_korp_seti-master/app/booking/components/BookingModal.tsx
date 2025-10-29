'use client';

import { Calendar, Clock, Users, X } from 'lucide-react';

interface BookingModalProps {
  selectedTable: number | null;
  bookingData: {
    date: string;
    time: string;
    duration: number;
    guestCount: number;
    clientName: string;
    clientPhone: string;
  };
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (field: string, value: string | number) => void;
  isTimeSlotAvailable: (timeSlot: string) => boolean;
}

export default function BookingModal({
  selectedTable,
  bookingData,
  isSubmitting,
  onClose,
  onSubmit,
  onInputChange,
  isTimeSlotAvailable,
}: BookingModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-soft max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 pb-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Параметры бронирования
          </h2>
          <p className="text-gray-600 text-center mt-2">
            Стол #{selectedTable}
          </p>
        </div>

        <form onSubmit={onSubmit} className="p-6 pt-0 space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Calendar className="w-5 h-5 text-yellow-600" />
              Дата бронирования
            </label>
            <input
              type="date"
              value={bookingData.date}
              onChange={(e) => onInputChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Clock className="w-5 h-5 text-yellow-600" />
              Время начала
            </label>
            <select
              value={bookingData.time}
              onChange={(e) => onInputChange('time', e.target.value)}
              required
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white text-gray-900 cursor-pointer"
            >
              <option value="">Выберите время</option>
              {['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
                '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
                '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'].map(time => {
                const available = isTimeSlotAvailable(time);
                return (
                  <option
                    key={time}
                    value={time}
                    disabled={!available}
                    style={{ color: available ? 'inherit' : '#999' }}
                  >
                    {time} {!available ? '(недоступно)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Clock className="w-5 h-5 text-yellow-600" />
              На сколько часов
            </label>
            <select
              value={bookingData.duration}
              onChange={(e) => onInputChange('duration', parseInt(e.target.value))}
              required
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white text-gray-900 cursor-pointer"
            >
              <option value={1}>1 час</option>
              <option value={2}>2 часа</option>
              <option value={3}>3 часа</option>
              <option value={4}>4 часа</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Users className="w-5 h-5 text-yellow-600" />
              ФИО (Имя Фамилия)
            </label>
            <input
              type="text"
              placeholder="Иван Иванов"
              value={bookingData.clientName}
              onChange={(e) => onInputChange('clientName', e.target.value)}
              required
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Номер телефона
            </label>
            <input
              type="tel"
              placeholder="+7 (999) 123-45-67"
              value={bookingData.clientPhone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d+]/g, '');
                onInputChange('clientPhone', value);
              }}
              required
              minLength={10}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Users className="w-5 h-5 text-yellow-600" />
              Количество гостей
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={bookingData.guestCount}
              onChange={(e) => onInputChange('guestCount', parseInt(e.target.value))}
              required
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-4 bg-yellow-400 text-black text-lg font-bold rounded-lg hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Бронирование...' : 'Забронировать'}
          </button>
        </form>
      </div>
    </div>
  );
}
