'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Users, Phone, User } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { TableCard } from './TableCard';
import { useAvailableTables, useCreateBooking } from '@/lib/hooks';
import { bookingCreateSchema } from '@/lib/validations';
import type { BookingCreate } from '@/types';

export function BookingForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<BookingCreate>>({
    start: '',
    end: '',
    guests: 2,
    clientName: '',
    phone: '',
  });
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasSearchParams = Boolean(formData.start && formData.end && formData.guests);
  const { data: tables, isLoading: isLoadingTables } = useAvailableTables({
    start: formData.start || '',
    end: formData.end || '',
    seats: formData.guests || 2,
  });

  const createBookingMutation = useCreateBooking();

  const handleInputChange = (field: keyof BookingCreate, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSearchTables = () => {
    // Сбросить выбор стола при новом поиске
    setSelectedTableId(null);

    // Валидация параметров поиска
    const result = bookingCreateSchema.safeParse({
      ...formData,
      tableId: 1, // Временно для валидации
    });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err: any) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTableId) {
      alert('Выберите столик');
      return;
    }

    const bookingData: BookingCreate = {
      ...formData,
      tableId: selectedTableId,
    } as BookingCreate;

    const validation = bookingCreateSchema.safeParse(bookingData);

    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err: any) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    try {
      const booking = await createBookingMutation.mutateAsync(bookingData);
      alert(`Бронирование создано! Номер: ${booking.id}`);
      router.push('/booking/search');
    } catch (err: any) {
      alert(`Ошибка: ${err.message}`);
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
              value={formData.start}
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
              value={formData.end}
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
              value={formData.guests}
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
                value={formData.clientName}
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
                value={formData.phone}
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
