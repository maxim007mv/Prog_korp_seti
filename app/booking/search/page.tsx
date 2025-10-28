'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { BookingList } from '@/components/features/booking';
import { useSearchBookings, useCancelBooking } from '@/lib/hooks';

export default function BookingSearchPage() {
  const [name, setName] = useState('');
  const [phoneSuffix, setPhoneSuffix] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const { data: bookings, isLoading } = useSearchBookings({
    name,
    phoneSuffix,
  });
  
  const cancelBooking = useCancelBooking();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phoneSuffix.length === 4) {
      setHasSearched(true);
    }
  };

  const handleCancel = async (id: number) => {
    if (confirm('Вы уверены, что хотите отменить бронь?')) {
      await cancelBooking.mutateAsync(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="mb-8 text-4xl font-bold">Поиск брони</h1>

        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl bg-white p-8 shadow-soft mb-8">
            <p className="mb-6 text-center text-gray-600">
              Введите ваше имя и последние 4 цифры телефона для поиска брони
            </p>

            <form onSubmit={handleSearch} className="space-y-4">
              <Input
                label="Имя"
                type="text"
                placeholder="Иван Иванов"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Последние 4 цифры телефона"
                type="text"
                placeholder="1234"
                value={phoneSuffix}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPhoneSuffix(value);
                }}
                maxLength={4}
                pattern="[0-9]{4}"
                required
              />

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={!name || phoneSuffix.length !== 4 || isLoading}
              >
                <Search className="h-5 w-5" />
                {isLoading ? 'Поиск...' : 'Найти бронь'}
              </Button>
            </form>
          </div>

          {hasSearched && (
            <div>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Поиск...</p>
                </div>
              ) : (
                <BookingList
                  bookings={bookings || []}
                  onCancel={handleCancel}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
