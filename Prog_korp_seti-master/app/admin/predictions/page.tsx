'use client';

import { useQuery } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { GlassCard } from '@/components/ui';
import { TrendingUp, Calendar, Award } from 'lucide-react';

export default function PredictionsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['table-predictions'],
    queryFn: () => aiApi.getTablePredictions(),
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-[24px] bg-white/5 backdrop-blur" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <GlassCard className="p-8 text-center rounded-[24px]">
          <p className="text-red-400 font-bold">Ошибка загрузки предсказаний</p>
          <p className="mt-2 text-sm text-red-300">{error?.message || 'Неизвестная ошибка'}</p>
        </GlassCard>
      </div>
    );
  }

  const { predictions, topTables, mostPopularDish } = data;
  const peakDay = predictions.reduce((max, p) => p.avgOccupancyRate > max.avgOccupancyRate ? p : max);

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <GlassCard className="p-6 rounded-[24px]">
        <h1 className="text-3xl font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">AI Предсказания на неделю</h1>
        <p className="text-white/70 mt-2">Прогноз загрузки столиков и популярных блюд на основе исторических данных</p>
      </GlassCard>

      {/* Ключевые метрики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 rounded-[24px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 uppercase tracking-wider">Пик загрузки</p>
              <p className="text-2xl font-bold mt-1 text-white">{peakDay.dayOfWeek}</p>
              <p className="text-sm text-green-400 mt-1">{peakDay.avgOccupancyRate.toFixed(1)}% средняя загрузка</p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-blue-400/20 flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-blue-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 rounded-[24px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 uppercase tracking-wider">Популярное блюдо</p>
              <p className="text-2xl font-bold mt-1 text-white">{mostPopularDish}</p>
              <p className="text-sm text-white/60 mt-1">на основе прогноза</p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-orange-400/20 flex items-center justify-center">
              <Award className="h-7 w-7 text-orange-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 rounded-[24px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 uppercase tracking-wider">Топ столиков</p>
              <p className="text-2xl font-bold mt-1 text-white">{topTables.length}</p>
              <p className="text-sm text-white/60 mt-1">самых загруженных</p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-purple-400/20 flex items-center justify-center">
              <Calendar className="h-7 w-7 text-purple-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Прогноз по дням */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white uppercase tracking-wider">Прогноз загрузки по дням</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {predictions.map((day, idx) => (
            <GlassCard key={idx} className="p-6 rounded-[24px]">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">{day.dayOfWeek}</h3>
                <p className="text-sm text-white/60">
                  {new Date(day.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </p>
              </div>

              <div className="space-y-4">
                {/* Общая загрузка */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">Средняя загрузка</span>
                    <span className="font-semibold text-white">{day.avgOccupancyRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        day.avgOccupancyRate > 70 ? 'bg-red-400' :
                        day.avgOccupancyRate > 50 ? 'bg-orange-400' :
                        'bg-green-400'
                      }`}
                      style={{ width: `${Math.min(day.avgOccupancyRate, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Ожидаемая выручка */}
                <div className="pt-2 border-t border-white/10">
                  <p className="text-sm text-white/60">Ожидаемая выручка</p>
                  <p className="text-xl font-bold text-amber-400">
                    {day.expectedRevenue.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })}
                  </p>
                </div>

                {/* Топ столики */}
                {day.topTables.length > 0 && (
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-sm text-white/60 mb-2">Топ столики на этот день</p>
                    <div className="flex flex-wrap gap-2">
                      {day.topTables.slice(0, 5).map((table, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-400/20 text-blue-300 rounded text-xs font-medium border border-blue-400/30">
                          #{table.tableId} ({Math.round(table.expectedOrders)})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Пиковые часы */}
                <div className="pt-2 border-t border-white/10">
                  <p className="text-sm text-white/60 mb-2">Пиковая загрузка по часам</p>
                  <div className="grid grid-cols-4 gap-1">
                    {day.hourlyPredictions
                      .filter(h => h.occupancyRate > 60)
                      .slice(0, 4)
                      .map((hour, i) => (
                        <div key={i} className="text-center">
                          <div className="text-xs font-semibold text-white">{hour.hour}:00</div>
                          <div className="text-xs text-white/60">{hour.occupancyRate.toFixed(0)}%</div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Топ столики за весь период */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white uppercase tracking-wider">Самые популярные столики</h2>
        <GlassCard className="p-6 rounded-[24px]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/80 font-semibold">Столик</th>
                  <th className="text-left py-3 px-4 text-white/80 font-semibold">Всего заказов</th>
                  <th className="text-left py-3 px-4 text-white/80 font-semibold">Общая выручка</th>
                  <th className="text-left py-3 px-4 text-white/80 font-semibold">Средний чек</th>
                  <th className="text-left py-3 px-4 text-white/80 font-semibold">Пиковые часы</th>
                  <th className="text-left py-3 px-4 text-white/80 font-semibold">Популярные дни</th>
                </tr>
              </thead>
              <tbody>
                {topTables.map((table, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">#{table.tableId}</td>
                    <td className="py-3 px-4 text-white/80">{table.totalOrders}</td>
                    <td className="py-3 px-4 text-amber-400 font-semibold">
                      {table.totalRevenue.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-4 text-white/80">
                      {table.avgRevenue.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {table.peakHours.slice(0, 3).map((hour, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-400/20 text-purple-300 rounded text-xs border border-purple-400/30">
                            {hour}:00
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {table.peakDays.slice(0, 3).map((day, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-400/20 text-blue-300 rounded text-xs border border-blue-400/30">
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
        </GlassCard>
      </div>
    </div>
  );
}
