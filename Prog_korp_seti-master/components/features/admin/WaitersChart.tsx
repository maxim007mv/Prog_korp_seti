'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatPrice } from '@/lib/utils';
import type { WaiterReport } from '@/types';

interface WaitersChartProps {
  data: WaiterReport;
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

export function WaitersChart({ data }: WaitersChartProps) {
  // Берём топ-5 официантов по выручке
  const topWaiters = [...data.rows]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const chartData = topWaiters.map((waiter) => ({
    name: waiter.name,
    revenue: waiter.revenue,
    orders: waiter.closedOrders,
    avgCheck: waiter.avgCheck,
  }));

  return (
    <LiquidGlass className="p-6 rounded-[24px]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Эффективность официантов</h2>
        <p className="mt-2 text-sm text-white/70">
          Топ-5 по выручке за период
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="name" 
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
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const data = payload[0].payload;
              return (
                <div className="rounded-lg bg-black/80 backdrop-blur-md p-3 shadow-lg border border-white/20">
                  <p className="font-semibold text-white">{data.name}</p>
                  <div className="mt-2 space-y-1 text-sm text-white/90">
                    <p>Выручка: <span className="font-semibold text-amber-400">{formatPrice(data.revenue)}</span></p>
                    <p>Заказов: <span className="font-semibold text-blue-400">{data.orders}</span></p>
                    <p>Средний чек: <span className="font-semibold text-green-400">{formatPrice(data.avgCheck)}</span></p>
                  </div>
                </div>
              );
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#fff' }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                revenue: 'Выручка',
                orders: 'Заказов',
              };
              return labels[value] || value;
            }}
          />
          <Bar dataKey="revenue" fill="#FFB84A" radius={[8, 8, 0, 0]} />
          <Bar dataKey="orders" fill="#60A5FA" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 border-t border-white/10 pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-3 text-left font-medium text-white/60 uppercase tracking-wider">Официант</th>
                <th className="pb-3 text-right font-medium text-white/60 uppercase tracking-wider">Заказов</th>
                <th className="pb-3 text-right font-medium text-white/60 uppercase tracking-wider">Выручка</th>
                <th className="pb-3 text-right font-medium text-white/60 uppercase tracking-wider">Ср. чек</th>
              </tr>
            </thead>
            <tbody>
              {topWaiters.map((waiter) => (
                <tr key={waiter.waiterId} className="border-b border-white/10 last:border-0">
                  <td className="py-3 text-white">{waiter.name}</td>
                  <td className="py-3 text-right text-blue-400">{waiter.closedOrders}</td>
                  <td className="py-3 text-right font-semibold text-amber-400">
                    {formatPrice(waiter.revenue)}
                  </td>
                  <td className="py-3 text-right text-green-400">
                    {formatPrice(waiter.avgCheck)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </LiquidGlass>
  );
}

