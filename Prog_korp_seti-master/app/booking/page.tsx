'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Calendar, Clock, Users, X } from 'lucide-react';
import { useCreateBooking, useTables, useBookings } from '@/lib/hooks';
import { BookingCreate, Booking } from '@/types';

// Динамические импорты для модальных окон (загружаются только при необходимости)
const BookingModal = dynamic(() => import('./components/BookingModal'), {
  loading: () => <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>,
  ssr: false
});

const MenuModal = dynamic(() => import('./components/MenuModal'), {
  loading: () => null,
  ssr: false
});

export default function BookingPage() {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    duration: 2, // длительность в часах
    guestCount: 2,
    clientName: '', // ФИО клиента
    clientPhone: '', // Номер телефона
  });
  
  const createBooking = useCreateBooking();
  const { data: tables, isLoading: tablesLoading, error: tablesError } = useTables();
  const { data: bookings, isLoading: bookingsLoading } = useBookings();

  const handleTableClick = (tableNumber: number) => {
    setSelectedTable(tableNumber);
    console.log('Выбран стол ' + tableNumber);
  };

  // Функция для определения доступных временных слотов
  const isTimeSlotAvailable = (timeSlot: string): boolean => {
    if (!bookingData.date) return true; // Если дата не выбрана, показываем все слоты
    
    const today = new Date();
    const selectedDate = new Date(bookingData.date);
    
    // Если выбрана не сегодняшняя дата, все слоты доступны
    if (selectedDate.toDateString() !== today.toDateString()) {
      return true;
    }
    
    // Для сегодняшнего дня проверяем, не прошло ли время
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotTime = new Date(today);
    slotTime.setHours(hours, minutes, 0, 0);
    
    // Добавляем 10 минут запаса
    return slotTime.getTime() > today.getTime() + 10 * 60 * 1000;
  };

  // Функция для получения активных бронирований стола
  const getTableBookings = (tableId: number): Booking[] => {
    if (!bookings) return [];
    return bookings.filter(
      (booking) => booking.tableId === tableId && booking.status === 'Active'
    );
  };

  // Функция для форматирования времени
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBookingClick = () => {
    if (selectedTable) {
      setShowBookingModal(true);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка заполнения обязательных полей
    if (!bookingData.clientName || !bookingData.clientPhone) {
      alert('Пожалуйста, заполните ФИО и номер телефона');
      return;
    }
    
    if (bookingData.clientPhone.length < 10) {
      alert('Введите корректный номер телефона (минимум 10 цифр)');
      return;
    }
    
    if (!selectedTable) {
      alert('Не выбран стол');
      return;
    }
    
    // Проверка, что время не в прошлом (сравниваем местное время)
    const startDateTime = `${bookingData.date}T${bookingData.time}:00`;
    const start = new Date(startDateTime);
    const now = new Date();
    
    // Добавляем буфер в 5 минут для обработки запроса
    if (start.getTime() <= now.getTime() + 5 * 60 * 1000) {
      alert('Выбранное время уже прошло или слишком близко. Пожалуйста, выберите время как минимум через 5 минут');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Формируем дату и время начала в локальной зоне и вычисляем конец
      const startDateTimeLocal = `${bookingData.date}T${bookingData.time}:00`;
      const startDate = new Date(startDateTimeLocal);
      const endDate = new Date(startDate.getTime() + bookingData.duration * 60 * 60 * 1000);

      // Отправляем даты в ISO формате с часовым поясом (toISOString), чтобы бэкенд корректно парсил и конвертировал в UTC
      const bookingCreateData: BookingCreate = {
        TableId: selectedTable!,
        ClientName: bookingData.clientName,
        ClientPhone: bookingData.clientPhone,
        StartTime: startDate.toISOString(),
        EndTime: endDate.toISOString(),
        Comment: '',
      };
      
      console.log('Отправка бронирования:', bookingCreateData);
      
      // Отправка данных на сервер
      const response = await createBooking.mutateAsync(bookingCreateData);
      
      // Сохраняем ID созданного бронирования
      if (response && response.id) {
        setCreatedBookingId(response.id);
      }
      
      // Закрываем модальное окно бронирования
      setShowBookingModal(false);
      
      // Показываем модальное окно выбора блюд
      setShowMenuModal(true);
      
    } catch (error: any) {
      console.error('Ошибка бронирования:', error);
      alert('Ошибка при бронировании: ' + (error.message || 'Неизвестная ошибка'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-[#222] text-white p-5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors">
            <ArrowLeft className="w-6 h-6" />
            <span className="text-lg font-bold">Назад</span>
          </Link>
          <h1 className="text-3xl font-bold">Выбор столика</h1>
          <div className="w-24"></div>
        </div>

        {/* План зала */}
        <div className="flex justify-center mb-8">
          <div
            className="relative bg-[#080808] border border-[#444] overflow-hidden"
            style={{
              width: '900px',
              height: '600px',
              backgroundImage:
                "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEVOVlZJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUkAAAB/h0p6AAAAG3RSTlMAAgMEBQYHCAkKCw0ODxAREhMUFRYXGBkaGxwdHh8gJvWaAAAAAWJLR0QN9rRhSwAAAJBJREFUSMe1l0kSwyAMRDGEXbFgbdhQ//+vG0FAVGEs9uL5AyS7LSFrD8NlRjPFoLIRKIYwMxAYvFBCo80kFCYDh8OQoPbEciGDBw5PJsSAhMHi0/yY/Zt/qc/T/B5/DqD/P/b8Cqx/Xv8z+P6Z/Iv8f8z+yfyP/L/M/8n8LwJ/If9v8p8Efpv8H/l/kf8n/wP5P/AfEp/IfwD/Iv+P+AfEp/If8D/iH8S/gP+RfxD/Aflv8h/yP+RfxD/If0j+y/yH/I/8P+AfJD/kfxD/If8j/wP5L/Jf8j/yP/JfACBf5P/If8j/yP/I/8D+S/yH/A/4h/gv8D/yL+A/JH/If8j/wP5L/If8D/yP+IfJD/kfxD/If8j/wP5L/Jf8j/yP/JfACBf5P/If8j/yP/I/8D+S/yH/A/BusinessAIdBef5Yd89a+dAAAAAElFTkSuQmCC')",
              boxShadow: '0 0 35px rgba(0,0,0,0.6) inset',
            }}
          >
            {/* === ЗОНА КУХНИ И БАРА === */}
            <Zone style={{ top: 20, left: 540, width: 340, height: 160, borderRadius: '8px 8px 0 8px' }}>
              Кухня
            </Zone>
            <Zone style={{ top: 180, left: 700, width: 180, height: 120, borderRadius: '0 0 8px 8px' }} />
            <Zone style={{ top: 200, left: 540, width: 150, height: 100 }} />

            {/* Стены Кухни */}
            <Wall style={{ top: 20, left: 538, width: 4, height: 280 }} />
            <Wall style={{ top: 180, left: 540, width: 160, height: 4 }} />
            <Wall style={{ top: 300, left: 540, width: 160, height: 4 }} />
            <Wall style={{ top: 180, left: 700, width: 4, height: 122 }} />
            <DoorSwing style={{ top: 300, left: 538, transform: 'scaleX(-1)' }} />

            {/* Барная стойка */}
            <Label style={{ top: 305, left: 540 }}>Барная стойка</Label>
            {[0, 1, 2, 3, 4].map((i) => (
              <TableGroup
                key={`bar-${i}`}
                style={{ top: 330, left: 540 + i * 30, width: 30, height: 50 }}
                onClick={() => handleTableClick(100 + i)}
              >
                <img
                  src="https://imghost.fun/images/2025/10/22/widget.png"
                  alt="Модуль бара"
                  className="w-[30px] transition-transform hover:scale-105"
                  style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/30x50/c00/fff?text=Bar';
                  }}
                />
              </TableGroup>
            ))}

            {/* === ЗОНА WC === */}
            <Label style={{ top: 380, left: 50, fontSize: 20, fontWeight: 'bold' }}>WC</Label>

            {/* Стены WC */}
            <Wall style={{ top: 400, left: 20, width: 132, height: 4 }} />
            <Wall style={{ top: 400, left: 20, width: 4, height: 180 }} />
            <Wall style={{ top: 580, left: 20, width: 132, height: 4 }} />
            <Wall style={{ top: 400, left: 150, width: 4, height: 180 }} />
            <DoorSwing style={{ top: 400, left: 120, transform: 'rotate(-90deg) scaleX(-1)' }} />
            <Wall style={{ top: 400, left: 85, width: 4, height: 180 }} />

            {/* Двери кабинок WC */}
            {[402, 447, 492, 537].map((topPos, i) => (
              <DoorSwingSmall key={`wc-door-${i}`} style={{ top: topPos, left: 85, transform: 'scaleX(-1)' }} />
            ))}

            <Wall style={{ top: 445, left: 20, width: 65, height: 4 }} />
            <Wall style={{ top: 490, left: 20, width: 65, height: 4 }} />
            <Wall style={{ top: 535, left: 20, width: 65, height: 4 }} />

            {/* === ЗОНА ГАРДЕРОБА И ВХОДА === */}
            <Wall style={{ top: 400, left: 700, width: 4, height: 180 }} />
            <Wall style={{ top: 400, left: 880, width: 4, height: 180 }} />
            <Wall style={{ top: 400, left: 700, width: 120, height: 4 }} />
            <Wall style={{ top: 580, left: 700, width: 120, height: 4 }} />
            <Wall style={{ top: 580, left: 850, width: 30, height: 4 }} />

            <DoorSwing style={{ top: 550, left: 820 }} />
            <Label
              style={{
                top: 605,
                left: 790,
                fontSize: 16,
                fontWeight: 'bold',
                width: 100,
                textAlign: 'center',
                letterSpacing: 1,
              }}
            >
              ВХОД
            </Label>

            {/* Гардероб */}
            <Zone style={{ top: 550, left: 720, width: 140, height: 20, borderRadius: 4 }} />
            <Label style={{ top: 555, left: 760, fontSize: 10 }}>Гардероб</Label>

            {/* === СТОЛЫ === */}
            <Wall style={{ top: 20, left: 150, width: 4, height: 350 }} />

            {/* Левый ряд - 3 стола по 6 мест */}
            <TableGroup
              style={{ top: 30, left: 30, width: 60, height: 80 }}
              onClick={() => handleTableClick(1)}
              selected={selectedTable === 1}
            >
              <img
                src="https://imghost.fun/images/2025/10/22/widget_busy_x2-2.png"
                alt="6-местный стол"
                className="h-[80px] w-auto"
                style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/60x80/c00/fff?text=Table';
                }}
              />
            </TableGroup>
            <Wall style={{ top: 112, left: 30, width: 60, height: 2 }} />

            <TableGroup
              style={{ top: 115, left: 30, width: 60, height: 80 }}
              onClick={() => handleTableClick(2)}
              selected={selectedTable === 2}
            >
              <img
                src="https://imghost.fun/images/2025/10/22/widget_busy_x2-2.png"
                alt="6-местный стол"
                className="h-[80px] w-auto"
                style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/60x80/c00/fff?text=Table';
                }}
              />
            </TableGroup>
            <Wall style={{ top: 197, left: 30, width: 60, height: 2 }} />

            <TableGroup
              style={{ top: 200, left: 30, width: 60, height: 80 }}
              onClick={() => handleTableClick(3)}
              selected={selectedTable === 3}
            >
              <img
                src="https://imghost.fun/images/2025/10/22/widget_busy_x2-2.png"
                alt="6-местный стол"
                className="h-[80px] w-auto"
                style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/60x80/c00/fff?text=Table';
                }}
              />
            </TableGroup>

            {/* Верхний ряд */}
            <TableGroup
              style={{ top: 40, left: 240, width: 60, height: 60 }}
              onClick={() => handleTableClick(4)}
              selected={selectedTable === 4}
            >
              <img
                src="https://imghost.fun/images/2025/10/22/widget_busy_x2.png"
                alt="4-местный стол"
                className="w-[60px]"
                style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/60x60/c00/fff?text=Table';
                }}
              />
            </TableGroup>

            <TableGroup
              style={{ top: 40, left: 400, width: 60, height: 60 }}
              onClick={() => handleTableClick(5)}
              selected={selectedTable === 5}
            >
              <img
                src="https://imghost.fun/images/2025/10/22/widget_busy_x2.png"
                alt="4-местный стол"
                className="w-[60px]"
                style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/60x60/c00/fff?text=Table';
                }}
              />
            </TableGroup>

            {/* Средний ряд */}
            <TableGroup
              style={{ top: 180, left: 240, width: 60, height: 80 }}
              onClick={() => handleTableClick(6)}
              selected={selectedTable === 6}
            >
              <img
                src="https://imghost.fun/images/2025/10/22/widget_busy_x2-2.png"
                alt="6-местный стол"
                className="h-[80px] w-auto"
                style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/60x80/c00/fff?text=Table';
                }}
              />
            </TableGroup>

            <TableGroup
              style={{ top: 180, left: 320, width: 60, height: 60 }}
              onClick={() => handleTableClick(7)}
              selected={selectedTable === 7}
            >
              <img
                src="https://imghost.fun/images/2025/10/22/widget_busy_x2.png"
                alt="4-местный стол"
                className="w-[60px]"
                style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/60x60/c00/fff?text=Table';
                }}
              />
            </TableGroup>

            <TableGroup
              style={{ top: 180, left: 400, width: 60, height: 60 }}
              onClick={() => handleTableClick(8)}
              selected={selectedTable === 8}
            >
              <img
                src="https://imghost.fun/images/2025/10/22/widget_busy_x2.png"
                alt="4-местный стол"
                className="w-[60px]"
                style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/60x60/c00/fff?text=Table';
                }}
              />
            </TableGroup>

            {/* Нижний-средний ряд */}
            <TableGroup
              style={{ top: 300, left: 240, width: 60, height: 60 }}
              onClick={() => handleTableClick(9)}
              selected={selectedTable === 9}
            >
              <img
                src="https://imghost.fun/images/2025/10/22/widget_busy_x2.png"
                alt="4-местный стол"
                className="w-[60px]"
                style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/60x60/c00/fff?text=Table';
                }}
              />
            </TableGroup>

            <TableGroup
              style={{ top: 300, left: 320, width: 60, height: 60 }}
              onClick={() => handleTableClick(10)}
              selected={selectedTable === 10}
            >
              <img
                src="https://imghost.fun/images/2025/10/22/widget_busy_x2.png"
                alt="4-местный стол"
                className="w-[60px]"
                style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/60x60/c00/fff?text=Table';
                }}
              />
            </TableGroup>

            <TableGroup
              style={{ top: 300, left: 400, width: 60, height: 60 }}
              onClick={() => handleTableClick(11)}
              selected={selectedTable === 11}
            >
              <img
                src="https://imghost.fun/images/2025/10/22/widget_busy_x2.png"
                alt="4-местный стол"
                className="w-[60px]"
                style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/60x60/c00/fff?text=Table';
                }}
              />
            </TableGroup>

            {/* === ЗОНА СВОБОДНОЙ ПОСАДКИ === */}
            <Label
              style={{
                top: 495,
                left: 200,
                fontSize: 14,
                fontWeight: 'bold',
                width: 340,
                textAlign: 'center',
              }}
            >
              Свободная посадка
            </Label>

            {/* Будки */}
            {[0, 1, 2].map((i) => (
              <TableGroup
                key={`booth-${i}`}
                style={{ top: 520, left: 200 + i * 60, width: 50, height: 50 }}
                onClick={() => handleTableClick(12 + i)}
                selected={selectedTable === 12 + i}
              >
                <img
                  src="https://imghost.fun/images/2025/10/22/widget_x2-2.png"
                  alt="Стол-будка"
                  className="w-[50px]"
                  style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/50x50/c00/fff?text=Booth';
                  }}
                />
              </TableGroup>
            ))}

            <TableGroup
              style={{ top: 515, left: 400, width: 60, height: 60 }}
              onClick={() => handleTableClick(15)}
              selected={selectedTable === 15}
            >
              <img
                src="https://imghost.fun/images/2025/10/22/widget_busy_x2.png"
                alt="4-местный стол"
                className="w-[60px]"
                style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/60x60/c00/fff?text=Table';
                }}
              />
            </TableGroup>

            <TableGroup
              style={{ top: 515, left: 480, width: 60, height: 60 }}
              onClick={() => handleTableClick(16)}
              selected={selectedTable === 16}
            >
              <img
                src="https://imghost.fun/images/2025/10/22/widget_busy_x2.png"
                alt="4-местный стол"
                className="w-[60px]"
                style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/60x60/c00/fff?text=Table';
                }}
              />
            </TableGroup>
          </div>
        </div>

        {/* Список реальных столов из БД */}
        <div className="mt-8 bg-[#333] rounded-lg border-2 border-yellow-400 p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Доступные столы</h2>
          
          {tablesLoading && (
            <div className="text-center text-gray-400">Загрузка столов...</div>
          )}
          
          {tablesError && (
            <div className="text-center text-red-400">
              Ошибка загрузки столов: {tablesError instanceof Error ? tablesError.message : 'Неизвестная ошибка'}
            </div>
          )}
          
          {tables && tables.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tables.map((table) => {
                const tableBookings = getTableBookings(table.id);
                const hasBookings = tableBookings.length > 0;
                
                return (
                  <div
                    key={table.id}
                    className={`
                      p-4 rounded-lg border-2 transition-all cursor-pointer
                      ${selectedTable === table.id 
                        ? 'bg-yellow-400 border-yellow-600 text-black' 
                        : hasBookings
                          ? 'bg-red-900/30 border-red-500/50 text-white'
                          : 'bg-[#222] border-[#444] text-white hover:border-yellow-400'
                      }
                    `}
                    onClick={() => handleTableClick(table.id)}
                  >
                    <div className="text-lg font-bold flex items-center justify-between">
                      <span>Стол #{table.id}</span>
                      {hasBookings && (
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                          Занят
                        </span>
                      )}
                    </div>
                    <div className="text-sm mt-2">{table.location}</div>
                    <div className="text-xs mt-1">{table.seats} мест</div>
                    
                    {/* Информация о бронированиях */}
                    {hasBookings && (
                      <div className="mt-3 pt-3 border-t border-gray-600 space-y-2">
                        <div className="text-xs font-semibold text-yellow-400">
                          📅 Бронирования:
                        </div>
                        {tableBookings.map((booking) => (
                          <div key={booking.id} className="text-xs bg-black/30 p-2 rounded">
                            <div className="font-medium">{booking.clientName}</div>
                            <div className="text-gray-400 mt-1">
                              🕐 {formatDateTime(booking.start)}
                            </div>
                            <div className="text-gray-400">
                              🕑 {formatDateTime(booking.end)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Информация о выбранном столе */}
        {selectedTable && (
          <div className="mt-8 p-6 bg-[#333] rounded-lg border-2 border-yellow-400 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Выбран стол #{selectedTable}</h2>
            <button 
              onClick={handleBookingClick}
              className="px-8 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Забронировать стол
            </button>
          </div>
        )}

        {/* Модальное окно выбора блюд */}
        {showMenuModal && (
          <MenuModal
            selectedTable={selectedTable}
            bookingData={bookingData}
            bookingId={createdBookingId || undefined}
            onClose={() => setShowMenuModal(false)}
          />
        )}

        {/* Модальное окно бронирования */}
        {showBookingModal && (
          <BookingModal
            selectedTable={selectedTable}
            bookingData={bookingData}
            isSubmitting={isSubmitting}
            onClose={() => setShowBookingModal(false)}
            onSubmit={handleBookingSubmit}
            onInputChange={handleInputChange}
            isTimeSlotAvailable={isTimeSlotAvailable}
          />
        )}
      </div>
    </div>
  );
}

// Вспомогательные компоненты
function Zone({ children, style }: { children?: React.ReactNode; style: React.CSSProperties }) {
  return (
    <div
      className="absolute bg-[#4a4a4a] flex justify-center items-center text-base font-bold"
      style={{
        ...style,
        backgroundImage: 'linear-gradient(to bottom, #5a5a5a, #4a4a4a)',
        boxShadow: '1px 1px 3px rgba(0,0,0,0.3) inset',
      }}
    >
      {children}
    </div>
  );
}

function Wall({ style }: { style: React.CSSProperties }) {
  return <div className="absolute bg-[#eee]" style={{ ...style, boxShadow: '0 0 5px rgba(255,255,255,0.4)' }} />;
}

function Label({ children, style }: { children: React.ReactNode; style: React.CSSProperties }) {
  return (
    <div className="absolute text-white text-xs" style={{ ...style, textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}>
      {children}
    </div>
  );
}

function DoorSwing({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute"
      style={{
        width: 30,
        height: 30,
        borderStyle: 'solid',
        borderColor: '#eee',
        borderWidth: '0 2px 0 0',
        borderRadius: '0 100% 0 0',
        boxShadow: '0 0 5px rgba(255,255,255,0.4)',
        ...style,
      }}
    />
  );
}

function DoorSwingSmall({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute"
      style={{
        width: 20,
        height: 20,
        borderStyle: 'solid',
        borderColor: '#eee',
        borderWidth: '0 1px 0 0',
        borderRadius: '0 100% 0 0',
        ...style,
      }}
    />
  );
}

interface TableGroupProps {
  children: React.ReactNode;
  style: React.CSSProperties;
  onClick: () => void;
  selected?: boolean;
}

function TableGroup({ children, style, onClick, selected }: TableGroupProps) {
  return (
    <div
      className={`absolute transition-all cursor-pointer hover:scale-105 hover:z-10 ${
        selected ? 'scale-110 z-20 ring-4 ring-yellow-400 rounded' : ''
      }`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
