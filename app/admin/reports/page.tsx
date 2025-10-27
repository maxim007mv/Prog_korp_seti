'use client';

import { useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import { GlassCard, Button, Input } from '@/components/ui';
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
    alert(\`Экспорт отчёта: \${reportType}\`);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <GlassCard className="p-6 rounded-[24px]">
        <h1 className="text-3xl font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">Отчёты</h1>
        <p className="mt-2 text-white/70">Детальная аналитика по закрытым заказам (ПЗ-4)</p>
      </GlassCard>

      {/* Выбор периода */}
      <GlassCard className="p-6 rounded-[24px]">
        <h2 className="text-lg font-bold mb-4 text-white uppercase tracking-wider">Период отчётов</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
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
            <label className="mb-2 block text-sm font-medium text-white/80">
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
            <button 
              className="px-4 py-2 rounded-xl text-sm bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-colors"
              onClick={() => setPeriod({
                from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                to: new Date().toISOString().split('T')[0],
              })}
            >7 дней</button>
            <button 
              className="px-4 py-2 rounded-xl text-sm bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-colors"
              onClick={() => setPeriod({
                from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                to: new Date().toISOString().split('T')[0],
              })}
            >30 дней</button>
          </div>
        </div>
      </GlassCard>

      {/* Отчёт по выручке */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Отчёт по выручке</h2>
          <button 
            className="px-4 py-2 rounded-xl text-sm bg-amber-400/30 border border-amber-400/50 text-amber-300 hover:bg-amber-400/40 transition-colors flex items-center gap-2"
            onClick={() => handleExport('revenue')}
          >
            <Download className="h-4 w-4" />
            Экспорт CSV
          </button>
        </div>
        {isLoadingRevenue ? (
          <div className="h-96 animate-pulse rounded-[24px] bg-white/5 backdrop-blur" />
        ) : revenueData ? (
          <RevenueChart data={revenueData} />
        ) : null}
      </div>

      {/* Отчёт по популярным блюдам */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Популярные блюда</h2>
          <button 
            className="px-4 py-2 rounded-xl text-sm bg-amber-400/30 border border-amber-400/50 text-amber-300 hover:bg-amber-400/40 transition-colors flex items-center gap-2"
            onClick={() => handleExport('dishes')}
          >
            <Download className="h-4 w-4" />
            Экспорт CSV
          </button>
        </div>
        {isLoadingDishes ? (
          <div className="h-96 animate-pulse rounded-[24px] bg-white/5 backdrop-blur" />
        ) : dishesData ? (
          <PopularDishesChart data={dishesData} />
        ) : null}
      </div>

      {/* Отчёт по официантам */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Эффективность официантов</h2>
          <button 
            className="px-4 py-2 rounded-xl text-sm bg-amber-400/30 border border-amber-400/50 text-amber-300 hover:bg-amber-400/40 transition-colors flex items-center gap-2"
            onClick={() => handleExport('waiters')}
          >
            <Download className="h-4 w-4" />
            Экспорт CSV
          </button>
        </div>
        {isLoadingWaiters ? (
          <div className="h-96 animate-pulse rounded-[24px] bg-white/5 backdrop-blur" />
        ) : waitersData ? (
          <WaitersChart data={waitersData} />
        ) : null}
      </div>
    </div>
  );
}
