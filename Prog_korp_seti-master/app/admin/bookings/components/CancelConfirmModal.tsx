'use client';

import { AlertTriangle } from 'lucide-react';

interface CancelConfirmModalProps {
  bookingId: number;
  clientName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CancelConfirmModal({
  bookingId,
  clientName,
  onConfirm,
  onCancel,
}: CancelConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-[28px] bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/10 shadow-2xl p-6">
        {/* Иконка предупреждения */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 border-2 border-red-500/50 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>

        {/* Заголовок */}
        <h2 className="text-xl font-bold text-white text-center mb-2">
          Отменить бронирование?
        </h2>

        {/* Описание */}
        <div className="space-y-2 mb-6">
          <p className="text-center text-white/70">
            Вы уверены, что хотите отменить бронирование для:
          </p>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-center text-white font-semibold">{clientName}</p>
            <p className="text-center text-white/50 text-sm mt-1">ID: #{bookingId}</p>
          </div>
          <p className="text-center text-red-300 text-sm mt-4">
            ⚠️ Это действие нельзя отменить
          </p>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors font-medium"
          >
            Нет, вернуться
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-semibold shadow-lg"
          >
            Да, отменить
          </button>
        </div>
      </div>
    </div>
  );
}
