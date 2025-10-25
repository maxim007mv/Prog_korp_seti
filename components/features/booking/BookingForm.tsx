'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Users, Phone, User } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { TableCard } from './TableCard';
import { useAvailableTables, useCreateBooking } from '@/lib/hooks';
import type { BookingCreate } from '@/types';

export function BookingForm() {
  const router = useRouter();
  
  // Локальное состояние формы (camelCase для удобства)
  const [localForm, setLocalForm] = useState({
    start: '',
    end: '',
    guests: 2,
    clientName: '',
    phone: '',
  });
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasSearchParams = Boolean(localForm.start && localForm.end && localForm.guests);
  const { data: tables, isLoading: isLoadingTables } = useAvailableTables({
    start: localForm.start || '',
    end: localForm.end || '',
    seats: localForm.guests || 2,
  });

  const createBookingMutation = useCreateBooking();

  const handleInputChange = (field: string, value: string | number) => {
    setLocalForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSearchTables = () => {
    // Сбросить выбор стола при новом поиске
    setSelectedTableId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTableId) {
      alert('Выберите столик');
      return;
    }

    // Конвертация в PascalCase для .NET backend
    const bookingData: BookingCreate = {
      TableId: selectedTableId,
      ClientName: localForm.clientName.trim(),
      ClientPhone: localForm.phone.trim(),
      StartTime: localForm.start,
      EndTime: localForm.end,
      Comment: '',
    };

    // Простая валидация
    const newErrors: Record<string, string> = {};
    
    if (!bookingData.ClientName || bookingData.ClientName.length < 2) {
      newErrors.clientName = 'Имя должно содержать минимум 2 символа';
    }
    
    if (!bookingData.ClientPhone || bookingData.ClientPhone.length < 10) {
      newErrors.phone = 'Введите корректный номер телефона';
    }
    
    if (!bookingData.StartTime) {
      newErrors.start = 'Укажите время начала';
    }
    
    if (!bookingData.EndTime) {
      newErrors.end = 'Укажите время окончания';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const booking = await createBookingMutation.mutateAsync(bookingData);
      alert(`Бронирование создано! Номер: ${booking.id}`);
      router.push('/booking/search');
    } catch (err: any) {
      const errorMsg = err?.error || err?.message || 'Ошибка создания бронирования';
      alert(`Ошибка: ${errorMsg}`);
      console.error('Booking error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Форма поиска */}
      <Card>
        <h2 className="mb-4 text-xl font-bold">Параметры бронирования</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              <Calendar className="mr-2 inline h-4 w-4" />
              Дата и время начала
            </label>
            <Input
              type="datetime-local"
              value={localForm.start}
              onChange={(e) => handleInputChange('start', e.target.value)}
              error={errors.start}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              <Clock className="mr-2 inline h-4 w-4" />
              Дата и время окончания
            </label>
            <Input
              type="datetime-local"
              value={localForm.end}
              onChange={(e) => handleInputChange('end', e.target.value)}
              error={errors.end}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              <Users className="mr-2 inline h-4 w-4" />
              Количество гостей
            </label>
            <Input
              type="number"
              min="1"
              max="20"
              value={localForm.guests}
              onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
              error={errors.guests}
            />
          </div>
          <div className="flex items-end">
            <Button variant="primary" onClick={handleSearchTables} className="w-full">
              Найти столики
            </Button>
          </div>
        </div>
      </Card>

      {/* Доступные столики */}
      {hasSearchParams && (
        <div>
          <h2 className="mb-4 text-xl font-bold">Доступные столики</h2>
          {isLoadingTables ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
          ) : tables && tables.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tables.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  onSelect={(t) => setSelectedTableId(t.id)}
                  selected={selectedTableId === table.id}
                />
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-center text-gray-600">
                Нет доступных столиков в указанное время
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Контактные данные и подтверждение */}
      {selectedTableId && (
        <Card>
          <h2 className="mb-4 text-xl font-bold">Контактные данные</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                <User className="mr-2 inline h-4 w-4" />
                Имя
              </label>
              <Input
                type="text"
                value={localForm.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                error={errors.clientName}
                placeholder="Иван Иванов"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                <Phone className="mr-2 inline h-4 w-4" />
                Телефон
              </label>
              <Input
                type="tel"
                value={localForm.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={errors.phone}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending
                ? 'Создание...'
                : 'Забронировать'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
