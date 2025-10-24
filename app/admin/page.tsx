'use client';

import { useState } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, ChefHat } from 'lucide-react';
import { KpiCard, RevenueChart, PopularDishesChart, WaitersChart } from '@/components/features/admin';
import { Button } from '@/components/ui';
import { useDashboardKpi, useRevenueReport, usePopularDishesReport, useWaitersReport } from '@/lib/hooks';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboard() {
  // Период по умолчанию - последние 7 дней
  const [period, setPeriod] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const { data: kpiData, isLoading: isLoadingKpi } = useDashboardKpi();
  const { data: revenueData, isLoading: isLoadingRevenue } = useRevenueReport(period);
  const { data: dishesData, isLoading: isLoadingDishes } = usePopularDishesReport(period);
  const { data: waitersData, isLoading: isLoadingWaiters } = useWaitersReport(period);

  const handlePeriodChange = (days: number) => {
    setPeriod({
      from: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Панель управления</h1>
          <p className="mt-2 text-gray-600">Обзор ключевых показателей ресторана</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={period.from === new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? 'primary' : 'outline'}
            onClick={() => handlePeriodChange(7)}
          >
            7 дней
          </Button>
          <Button
            variant={period.from === new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? 'primary' : 'outline'}
            onClick={() => handlePeriodChange(30)}
          >
            30 дней
          </Button>
          <Button
            variant={period.from === new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? 'primary' : 'outline'}
            onClick={() => handlePeriodChange(90)}
          >
            90 дней
          </Button>
        </div>
      </div>

      {/* KPI карточки */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoadingKpi ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </>
        ) : kpiData ? (
          <>
            <KpiCard
              title="Выручка сегодня"
              value={formatPrice(kpiData.todayRevenue)}
              icon={DollarSign}
            />
            <KpiCard
              title="Заказов сегодня"
              value={kpiData.todayOrders}
              icon={ShoppingCart}
            />
            <KpiCard
              title="Средний чек"
              value={formatPrice(kpiData.avgCheck)}
              icon={TrendingUp}
            />
            <KpiCard
              title="Топ блюдо"
              value={kpiData.topDish?.name || 'Нет данных'}
              subtitle={kpiData.topDish ? `${kpiData.topDish.ordersCount} заказов` : undefined}
              icon={ChefHat}
            />
          </>
        ) : (
          <div className="col-span-4 rounded-lg bg-red-50 p-6 text-center">
            <p className="text-red-600">Ошибка загрузки KPI</p>
          </div>
        )}
      </div>

      {/* Графики */}
      <div className="space-y-6">
        {/* График выручки */}
        {isLoadingRevenue ? (
          <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
        ) : revenueData ? (
          <RevenueChart data={revenueData} />
        ) : (
          <div className="rounded-lg bg-red-50 p-6 text-center">
            <p className="text-red-600">Ошибка загрузки данных о выручке</p>
          </div>
        )}

        {/* Графики популярных блюд и официантов */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Популярные блюда */}
          {isLoadingDishes ? (
            <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
          ) : dishesData ? (
            <PopularDishesChart data={dishesData} />
          ) : (
            <div className="rounded-lg bg-red-50 p-6 text-center">
              <p className="text-red-600">Ошибка загрузки данных о блюдах</p>
            </div>
          )}

          {/* Официанты */}
          {isLoadingWaiters ? (
            <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
          ) : waitersData ? (
            <WaitersChart data={waitersData} />
          ) : (
            <div className="rounded-lg bg-red-50 p-6 text-center">
              <p className="text-red-600">Ошибка загрузки данных об официантах</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
