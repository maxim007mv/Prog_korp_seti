'use client';

import { useQuery } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { Card } from '@/components/ui';

export default function PredictionsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['table-predictions'],
    queryFn: () => aiApi.getTablePredictions(),
    refetchInterval: 60000, // Обновляем каждую минуту
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">AI Предсказания</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">AI Предсказания</h1>
        <Card className="p-6 text-center text-red-600">
          Ошибка загрузки предсказаний: {error?.message || 'Неизвестная ошибка'}
        </Card>
      </div>
    );
  }

  const { predictions, topTables, mostPopularDish } = data;

  // Находим самый загруженный день
  const peakDay = predictions.reduce((max, p) => 
    p.avgOccupancyRate > max.avgOccupancyRate ? p : max
  );

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold">AI Предсказания на неделю</h1>
        <p className="text-gray-600 mt-2">
          Прогноз загрузки столиков и популярных блюд на основе исторических данных
        </p>
      </div>

      {/* Ключевые метрики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Пик загрузки</p>
              <p className="text-2xl font-bold mt-1">{peakDay.dayOfWeek}</p>
              <p className="text-sm text-green-600 mt-1">
                {peakDay.avgOccupancyRate.toFixed(1)}% средняя загрузка
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Самое популярное блюдо</p>
              <p className="text-2xl font-bold mt-1">{mostPopularDish}</p>
              <p className="text-sm text-gray-600 mt-1">на основе прогноза</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Топ столиков</p>
              <p className="text-2xl font-bold mt-1">{topTables.length}</p>
              <p className="text-sm text-gray-600 mt-1">самых загруженных</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Прогноз по дням */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Прогноз загрузки по дням</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {predictions.map((day, idx) => (
            <Card key={idx} className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold">{day.dayOfWeek}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('ru-RU', { 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>

              <div className="space-y-4">
                {/* Общая загрузка */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Средняя загрузка</span>
                    <span className="font-semibold">{day.avgOccupancyRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        day.avgOccupancyRate > 70 ? 'bg-red-500' :
                        day.avgOccupancyRate > 50 ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(day.avgOccupancyRate, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Ожидаемая выручка */}
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600">Ожидаемая выручка</p>
                  <p className="text-xl font-bold">
                    {day.expectedRevenue.toLocaleString('ru-RU', { 
                      style: 'currency', 
                      currency: 'RUB',
                      maximumFractionDigits: 0 
                    })}
                  </p>
                </div>

                {/* Топ столики */}
                {day.topTables.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600 mb-2">Топ столики на этот день</p>
                    <div className="flex flex-wrap gap-2">
                      {day.topTables.slice(0, 5).map((table, i) => (
                        <span 
                          key={i}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                        >
                          #{table.tableId} ({Math.round(table.expectedOrders)})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Пиковые часы */}
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600 mb-2">Пиковая загрузка по часам</p>
                  <div className="grid grid-cols-4 gap-1">
                    {day.hourlyPredictions
                      .filter(h => h.occupancyRate > 60)
                      .slice(0, 4)
                      .map((hour, i) => (
                        <div key={i} className="text-center">
                          <div className="text-xs font-semibold">
                            {hour.hour}:00
                          </div>
                          <div className="text-xs text-gray-600">
                            {hour.occupancyRate.toFixed(0)}%
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Топ столики за весь период */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Самые популярные столики</h2>
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Столик</th>
                  <th className="text-left py-3 px-4">Всего заказов</th>
                  <th className="text-left py-3 px-4">Общая выручка</th>
                  <th className="text-left py-3 px-4">Средний чек</th>
                  <th className="text-left py-3 px-4">Пиковые часы</th>
                  <th className="text-left py-3 px-4">Популярные дни</th>
                </tr>
              </thead>
              <tbody>
                {topTables.map((table, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">#{table.tableId}</td>
                    <td className="py-3 px-4">{table.totalOrders}</td>
                    <td className="py-3 px-4">
                      {table.totalRevenue.toLocaleString('ru-RU', { 
                        style: 'currency', 
                        currency: 'RUB',
                        maximumFractionDigits: 0 
                      })}
                    </td>
                    <td className="py-3 px-4">
                      {table.avgRevenue.toLocaleString('ru-RU', { 
                        style: 'currency', 
                        currency: 'RUB',
                        maximumFractionDigits: 0 
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {table.peakHours.slice(0, 3).map((hour, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                            {hour}:00
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {table.peakDays.slice(0, 3).map((day, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {day}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
