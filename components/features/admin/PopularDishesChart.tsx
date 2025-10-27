'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatPrice } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/constants';
import type { PopularDishesReport } from '@/types';

interface PopularDishesChartProps {
  data: PopularDishesReport;
}

const COLORS = ['#FFB84A', '#FF8042', '#00C49F', '#60A5FA', '#FFBB28'];

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

export function PopularDishesChart({ data }: PopularDishesChartProps) {
  // Берём топ-5 блюд
  const topDishes = data.rows.slice(0, 5);

  const chartData = topDishes.map((dish) => ({
    name: dish.name.length > 20 ? dish.name.substring(0, 20) + '...' : dish.name,
    fullName: dish.name,
    qty: dish.qty,
    revenue: dish.revenue,
    share: dish.share,
    category: CATEGORY_LABELS[dish.category],
  }));

  return (
    <LiquidGlass className="p-6 rounded-[24px]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Топ-5 популярных блюд</h2>
        <p className="mt-2 text-sm text-white/70">
          По количеству заказов за период
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            type="number" 
            tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }} 
            stroke="rgba(255,255,255,0.3)" 
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={150}
            tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
            stroke="rgba(255,255,255,0.3)"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '12px',
              backdropFilter: 'blur(10px)',
            }}
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const data = payload[0].payload;
              return (
                <div className="rounded-lg bg-black/80 backdrop-blur-md p-3 shadow-lg border border-white/20">
                  <p className="font-semibold text-white">{data.fullName}</p>
                  <p className="text-sm text-white/60">{data.category}</p>
                  <div className="mt-2 space-y-1 text-sm text-white/90">
                    <p>Заказано: <span className="font-semibold text-amber-400">{data.qty} раз</span></p>
                    <p>Выручка: <span className="font-semibold text-green-400">{formatPrice(data.revenue)}</span></p>
                    <p>Доля: <span className="font-semibold text-blue-400">{data.share.toFixed(1)}%</span></p>
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="qty" radius={[0, 8, 8, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 border-t border-white/10 pt-6">
        <div className="space-y-3">
          {topDishes.map((dish, index) => (
            <div key={dish.dishId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full shadow-lg"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div>
                  <p className="text-sm font-medium text-white">{dish.name}</p>
                  <p className="text-xs text-white/50">{CATEGORY_LABELS[dish.category]}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-amber-400">{dish.qty} заказов</p>
                <p className="text-xs text-white/50">{dish.share.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LiquidGlass>
  );
}

