'use client';

import { useState } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, ChefHat } from 'lucide-react';
import { KpiCard, RevenueChart, PopularDishesChart, WaitersChart } from '@/components/features/admin';
import { Button } from '@/components/ui';
import { useDashboardKpi, useRevenueReport, usePopularDishesReport, useWaitersReport } from '@/lib/hooks';
import { formatPrice } from '@/lib/utils';

function LiquidGlass({
  className = "",
  contentClassName = "",
  children,
}: React.PropsWithChildren<{ className?: string; contentClassName?: string }>) {
  return (
    <div className={`liquidGlass-wrapper ${className}`}>
      <div className="liquidGlass-effect" />
      <div className="liquidGlass-tint" />
      <div className="liquidGlass-shine" />
      <div className={`liquidGlass-text ${contentClassName}`}>{children}</div>
    </div>
  );
}

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
    <div className="space-y-6">
      {/* Заголовок */}
      <LiquidGlass className="p-6 rounded-[24px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              Панель управления
            </h1>
            <p className="mt-2 text-white/70">Обзор ключевых показателей ресторана</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePeriodChange(7)}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                period.from === new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                  ? 'bg-amber-400/30 border border-amber-400/50 text-amber-300 shadow-lg'
                  : 'bg-white/10 border border-white/20 text-white/80 hover:bg-white/20'
              }`}
            >
              7 дней
            </button>
            <button
              onClick={() => handlePeriodChange(30)}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                period.from === new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                  ? 'bg-amber-400/30 border border-amber-400/50 text-amber-300 shadow-lg'
                  : 'bg-white/10 border border-white/20 text-white/80 hover:bg-white/20'
              }`}
            >
              30 дней
            </button>
            <button
              onClick={() => handlePeriodChange(90)}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                period.from === new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                  ? 'bg-amber-400/30 border border-amber-400/50 text-amber-300 shadow-lg'
                  : 'bg-white/10 border border-white/20 text-white/80 hover:bg-white/20'
              }`}
            >
              90 дней
            </button>
          </div>
        </div>
      </LiquidGlass>

      {/* KPI карточки */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoadingKpi ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-[24px] bg-white/5 backdrop-blur" />
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
          <div className="col-span-4">
            <LiquidGlass className="p-6 rounded-[24px]">
              <p className="text-red-400 text-center">Ошибка загрузки KPI</p>
            </LiquidGlass>
          </div>
        )}
      </div>

      {/* Графики */}
      <div className="space-y-6">
        {/* График выручки */}
        {isLoadingRevenue ? (
          <div className="h-96 animate-pulse rounded-[24px] bg-white/5 backdrop-blur" />
        ) : revenueData ? (
          <RevenueChart data={revenueData} />
        ) : (
          <LiquidGlass className="p-6 rounded-[24px]">
            <p className="text-red-400 text-center">Ошибка загрузки данных о выручке</p>
          </LiquidGlass>
        )}

        {/* Графики популярных блюд и официантов */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Популярные блюда */}
          {isLoadingDishes ? (
            <div className="h-96 animate-pulse rounded-[24px] bg-white/5 backdrop-blur" />
          ) : dishesData ? (
            <PopularDishesChart data={dishesData} />
          ) : (
            <LiquidGlass className="p-6 rounded-[24px]">
              <p className="text-red-400 text-center">Ошибка загрузки данных о блюдах</p>
            </LiquidGlass>
          )}

          {/* Официанты */}
          {isLoadingWaiters ? (
            <div className="h-96 animate-pulse rounded-[24px] bg-white/5 backdrop-blur" />
          ) : waitersData ? (
            <WaitersChart data={waitersData} />
          ) : (
            <LiquidGlass className="p-6 rounded-[24px]">
              <p className="text-red-400 text-center">Ошибка загрузки данных об официантах</p>
            </LiquidGlass>
          )}
        </div>
      </div>
    </div>
  );
}

