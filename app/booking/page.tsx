'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Users, X } from 'lucide-react';
import { useCreateBooking, useTables, useBookings } from '@/lib/hooks';
import { BookingCreate, Booking } from '@/types';

export default function BookingPage() {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    
    setIsSubmitting(true);
    
    try {
      // Формируем дату и время начала
      const startDateTime = `${bookingData.date}T${bookingData.time}:00`;
      
      // Вычисляем дату и время окончания (добавляем часы)
      const start = new Date(startDateTime);
      const end = new Date(start.getTime() + bookingData.duration * 60 * 60 * 1000);
      
      // Подготовка данных для API (PascalCase для .NET backend)
      const bookingCreateData: BookingCreate = {
        TableId: selectedTable,
        ClientName: bookingData.clientName,
        ClientPhone: bookingData.clientPhone,
        StartTime: start.toISOString(),
        EndTime: end.toISOString(),
        Comment: '',
      };
      
      console.log('Отправка бронирования:', bookingCreateData);
      
      // Отправка данных на сервер
      await createBooking.mutateAsync(bookingCreateData);
      
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-soft max-w-2xl w-full mx-4 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowMenuModal(false)}
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
                    💡 Для поиска брони используйте: <br/>
                    - Ваше имя и фамилию<br/>
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
                    onClick={() => setShowMenuModal(false)}
                  >
                    📋 Перейти в меню
                  </Link>

                  <button
                    onClick={() => setShowMenuModal(false)}
                    className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                  >
                    Пропустить
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно бронирования */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-soft max-w-md w-full mx-4 relative">
              {/* Кнопка закрытия */}
              <button
                onClick={() => setShowBookingModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Заголовок */}
              <div className="p-6 pb-4">
                <h2 className="text-2xl font-bold text-gray-900 text-center">
                  Параметры бронирования
                </h2>
                <p className="text-gray-600 text-center mt-2">
                  Стол #{selectedTable}
                </p>
              </div>

              {/* Форма */}
              <form onSubmit={handleBookingSubmit} className="p-6 pt-0 space-y-4">
                {/* Дата бронирования */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                    Дата бронирования
                  </label>
                  <input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white text-gray-900"
                  />
                </div>

                {/* Время начала */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    Время начала
                  </label>
                  <select
                    value={bookingData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    required
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white text-gray-900 cursor-pointer"
                  >
                    <option value="">Выберите время</option>
                    <option value="10:00">10:00</option>
                    <option value="10:30">10:30</option>
                    <option value="11:00">11:00</option>
                    <option value="11:30">11:30</option>
                    <option value="12:00">12:00</option>
                    <option value="12:30">12:30</option>
                    <option value="13:00">13:00</option>
                    <option value="13:30">13:30</option>
                    <option value="14:00">14:00</option>
                    <option value="14:30">14:30</option>
                    <option value="15:00">15:00</option>
                    <option value="15:30">15:30</option>
                    <option value="16:00">16:00</option>
                    <option value="16:30">16:30</option>
                    <option value="17:00">17:00</option>
                    <option value="17:30">17:30</option>
                    <option value="18:00">18:00</option>
                    <option value="18:30">18:30</option>
                    <option value="19:00">19:00</option>
                    <option value="19:30">19:30</option>
                    <option value="20:00">20:00</option>
                    <option value="20:30">20:30</option>
                    <option value="21:00">21:00</option>
                    <option value="21:30">21:30</option>
                    <option value="22:00">22:00</option>
                  </select>
                </div>

                {/* Длительность брони */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    На сколько часов
                  </label>
                  <select
                    value={bookingData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    required
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white text-gray-900 cursor-pointer"
                  >
                    <option value={1}>1 час</option>
                    <option value={2}>2 часа</option>
                    <option value={3}>3 часа</option>
                    <option value={4}>4 часа</option>
                  </select>
                </div>

                {/* ФИО клиента */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <Users className="w-5 h-5 text-yellow-600" />
                    ФИО (Имя Фамилия)
                  </label>
                  <input
                    type="text"
                    placeholder="Иван Иванов"
                    value={bookingData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    required
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white text-gray-900"
                  />
                </div>

                {/* Номер телефона */}
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
                      // Оставляем только цифры и +
                      const value = e.target.value.replace(/[^\d+]/g, '');
                      handleInputChange('clientPhone', value);
                    }}
                    required
                    minLength={10}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white text-gray-900"
                  />
                </div>

                {/* Количество гостей */}
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
                    onChange={(e) => handleInputChange('guestCount', parseInt(e.target.value))}
                    required
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white text-gray-900"
                  />
                </div>

                {/* Кнопка подтверждения */}
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
