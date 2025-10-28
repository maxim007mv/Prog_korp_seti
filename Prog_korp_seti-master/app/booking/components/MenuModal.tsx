'use client';

import Link from 'next/link';
import { X } from 'lucide-react';

interface MenuModalProps {
  selectedTable: number | null;
  bookingData: {
    date: string;
    time: string;
    clientName: string;
    clientPhone: string;
  };
  onClose: () => void;
}

export default function MenuModal({ selectedTable, bookingData, onClose }: MenuModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-soft max-w-2xl w-full mx-4 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            🎉 Стол забронирован!
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Стол #{selectedTable} на {bookingData.date} в {bookingData.time}
          </p>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold mb-2">✓ Данные вашей брони:</p>
            <p className="text-sm text-green-700">ФИО: {bookingData.clientName}</p>
            <p className="text-sm text-green-700">Телефон: {bookingData.clientPhone}</p>
            <p className="text-sm text-green-700 mt-2">
              💡 Для поиска брони используйте: <br />
              - Ваше имя и фамилию<br />
              - Последние 4 цифры: <strong>{bookingData.clientPhone.slice(-4)}</strong>
            </p>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Хотите заказать блюда к столу?
          </h3>

          <div className="space-y-4">
            <Link
              href="/menu"
              className="block w-full px-6 py-4 bg-yellow-400 text-black text-lg font-bold rounded-lg hover:bg-yellow-500 transition-all text-center"
              onClick={onClose}
            >
              📋 Перейти в меню
            </Link>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
            >
              Пропустить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
