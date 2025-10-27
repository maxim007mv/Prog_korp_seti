'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatPrice } from '@/lib/utils';
import type { RevenueReport } from '@/types';

interface RevenueChartProps {
  data: RevenueReport;
}

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

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.points.map((point) => ({
    date: new Date(point.date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
    }),
    revenue: point.revenue,
    orders: point.orders,
    avgCheck: point.avgCheck,
  }));

  return (
    <LiquidGlass className="p-6 rounded-[24px]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Выручка по дням</h2>
        <p className="mt-2 text-sm text-white/70">
          Динамика выручки и среднего чека
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
            stroke="rgba(255,255,255,0.3)"
          />
          <YAxis 
            tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
            stroke="rgba(255,255,255,0.3)"
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '12px',
              backdropFilter: 'blur(10px)',
            }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
            formatter={(value: number, name: string) => {
              if (name === 'revenue' || name === 'avgCheck') {
                return [formatPrice(value), name === 'revenue' ? 'Выручка' : 'Средний чек'];
              }
              return [value, 'Заказов'];
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#fff' }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                revenue: 'Выручка',
                avgCheck: 'Средний чек',
                orders: 'Заказов',
              };
              return labels[value] || value;
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#FFB84A"
            strokeWidth={3}
            dot={{ fill: '#FFB84A', r: 4 }}
            activeDot={{ r: 7, fill: '#FFB84A' }}
          />
          <Line
            type="monotone"
            dataKey="avgCheck"
            stroke="#60A5FA"
            strokeWidth={3}
            dot={{ fill: '#60A5FA', r: 4 }}
            activeDot={{ r: 7, fill: '#60A5FA' }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
        <div>
          <p className="text-sm text-white/60 uppercase tracking-wider">Всего выручка</p>
          <p className="mt-2 text-2xl font-bold text-amber-400">
            {formatPrice(data.total.revenue)}
          </p>
        </div>
        <div>
          <p className="text-sm text-white/60 uppercase tracking-wider">Всего заказов</p>
          <p className="mt-2 text-2xl font-bold text-white">{data.total.orders}</p>
        </div>
        <div>
          <p className="text-sm text-white/60 uppercase tracking-wider">Средний чек</p>
          <p className="mt-2 text-2xl font-bold text-blue-400">
            {formatPrice(data.total.avgCheck)}
          </p>
        </div>
      </div>
    </LiquidGlass>
  );
}

