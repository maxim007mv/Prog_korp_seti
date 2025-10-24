'use client';

import { useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { RevenueChart, PopularDishesChart, WaitersChart } from '@/components/features/admin';
import { useRevenueReport, usePopularDishesReport, useWaitersReport } from '@/lib/hooks';
import { formatPrice } from '@/lib/utils';

export default function AdminReportsPage() {
  const [period, setPeriod] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const { data: revenueData, isLoading: isLoadingRevenue } = useRevenueReport(period);
  const { data: dishesData, isLoading: isLoadingDishes } = usePopularDishesReport(period);
  const { data: waitersData, isLoading: isLoadingWaiters } = useWaitersReport(period);

  const handleExport = (reportType: string) => {
    alert(`Экспорт отчёта: ${reportType}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Отчёты</h1>
        <p className="mt-2 text-gray-600">
          Детальная аналитика по закрытым заказам (ПЗ-4)
        </p>
      </div>

      {/* Выбор периода */}
      <Card className="mb-8">
        <div className="mb-4">
          <h2 className="text-lg font-bold">Период отчётов</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">
              <Calendar className="mr-2 inline h-4 w-4" />
              Дата начала
            </label>
            <Input
              type="date"
              value={period.from}
              onChange={(e) => setPeriod({ ...period, from: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              <Calendar className="mr-2 inline h-4 w-4" />
              Дата окончания
            </label>
            <Input
              type="date"
              value={period.to}
              onChange={(e) => setPeriod({ ...period, to: e.target.value })}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button variant="outline" onClick={() => setPeriod({
              from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              to: new Date().toISOString().split('T')[0],
            })}>
              7 дней
            </Button>
            <Button variant="outline" onClick={() => setPeriod({
              from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              to: new Date().toISOString().split('T')[0],
            })}>
              30 дней
            </Button>
          </div>
        </div>
      </Card>

      {/* Отчёт по выручке */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Отчёт по выручке</h2>
          <Button variant="outline" onClick={() => handleExport('revenue')}>
            <Download className="mr-2 h-4 w-4" />
            Экспорт CSV
          </Button>
        </div>
        {isLoadingRevenue ? (
          <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
        ) : revenueData ? (
          <>
            <RevenueChart data={revenueData} />
            
            {/* Таблица данных */}
            <Card className="mt-6">
              <h3 className="mb-4 font-bold">Детальные данные</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium text-gray-600">Дата</th>
                      <th className="pb-2 text-right font-medium text-gray-600">Выручка</th>
                      <th className="pb-2 text-right font-medium text-gray-600">Заказов</th>
                      <th className="pb-2 text-right font-medium text-gray-600">Средний чек</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.points.map((point) => (
                      <tr key={point.date} className="border-b last:border-0">
                        <td className="py-2">
                          {new Date(point.date).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="py-2 text-right font-semibold">
                          {formatPrice(point.revenue)}
                        </td>
                        <td className="py-2 text-right">{point.orders}</td>
                        <td className="py-2 text-right">
                          {formatPrice(point.avgCheck)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        ) : (
          <Card>
            <p className="text-center text-red-600">Ошибка загрузки данных о выручке</p>
          </Card>
        )}
      </div>

      {/* Отчёт по официантам */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Отчёт по официантам</h2>
          <Button variant="outline" onClick={() => handleExport('waiters')}>
            <Download className="mr-2 h-4 w-4" />
            Экспорт CSV
          </Button>
        </div>
        {isLoadingWaiters ? (
          <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
        ) : waitersData ? (
          <WaitersChart data={waitersData} />
        ) : (
          <Card>
            <p className="text-center text-red-600">Ошибка загрузки данных об официантах</p>
          </Card>
        )}
      </div>

      {/* Отчёт популярности блюд */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Отчёт популярности блюд</h2>
          <Button variant="outline" onClick={() => handleExport('dishes')}>
            <Download className="mr-2 h-4 w-4" />
            Экспорт CSV
          </Button>
        </div>
        {isLoadingDishes ? (
          <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
        ) : dishesData ? (
          <>
            <PopularDishesChart data={dishesData} />
            
            {/* Полная таблица */}
            <Card className="mt-6">
              <h3 className="mb-4 font-bold">Все блюда</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium text-gray-600">Блюдо</th>
                      <th className="pb-2 text-right font-medium text-gray-600">Заказано</th>
                      <th className="pb-2 text-right font-medium text-gray-600">Доля</th>
                      <th className="pb-2 text-right font-medium text-gray-600">Выручка</th>
                      <th className="pb-2 text-center font-medium text-gray-600">Тренд</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dishesData.rows.map((dish) => (
                      <tr key={dish.dishId} className="border-b last:border-0">
                        <td className="py-2">{dish.name}</td>
                        <td className="py-2 text-right font-semibold">{dish.qty}</td>
                        <td className="py-2 text-right">{dish.share.toFixed(1)}%</td>
                        <td className="py-2 text-right font-semibold">
                          {formatPrice(dish.revenue)}
                        </td>
                        <td className="py-2 text-center">
                          {dish.trend === 'up' && (
                            <span className="text-green-600">↑</span>
                          )}
                          {dish.trend === 'down' && (
                            <span className="text-red-600">↓</span>
                          )}
                          {dish.trend === 'stable' && (
                            <span className="text-gray-400">→</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        ) : (
          <Card>
            <p className="text-center text-red-600">Ошибка загрузки данных о блюдах</p>
          </Card>
        )}
      </div>
    </div>
  );
}
