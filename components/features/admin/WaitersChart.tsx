'use client';

import { Card } from '@/components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatPrice } from '@/lib/utils';
import type { WaiterReport } from '@/types';

interface WaitersChartProps {
  data: WaiterReport;
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
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-bold">Эффективность официантов</h2>
        <p className="mt-1 text-sm text-gray-600">
          Топ-5 по выручке за период
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#666"
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const data = payload[0].payload;
              return (
                <div className="rounded-lg bg-white p-3 shadow-lg">
                  <p className="font-semibold">{data.name}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>Выручка: <span className="font-semibold">{formatPrice(data.revenue)}</span></p>
                    <p>Заказов: <span className="font-semibold">{data.orders}</span></p>
                    <p>Средний чек: <span className="font-semibold">{formatPrice(data.avgCheck)}</span></p>
                  </div>
                </div>
              );
            }}
          />
          <Legend 
            formatter={(value) => {
              const labels: Record<string, string> = {
                revenue: 'Выручка',
                orders: 'Заказов',
              };
              return labels[value] || value;
            }}
          />
          <Bar dataKey="revenue" fill="#FFB84A" radius={[8, 8, 0, 0]} />
          <Bar dataKey="orders" fill="#8884d8" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 border-t pt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left font-medium text-gray-600">Официант</th>
                <th className="pb-2 text-right font-medium text-gray-600">Заказов</th>
                <th className="pb-2 text-right font-medium text-gray-600">Выручка</th>
                <th className="pb-2 text-right font-medium text-gray-600">Ср. чек</th>
              </tr>
            </thead>
            <tbody>
              {topWaiters.map((waiter) => (
                <tr key={waiter.waiterId} className="border-b last:border-0">
                  <td className="py-2">{waiter.name}</td>
                  <td className="py-2 text-right">{waiter.closedOrders}</td>
                  <td className="py-2 text-right font-semibold">
                    {formatPrice(waiter.revenue)}
                  </td>
                  <td className="py-2 text-right text-gray-600">
                    {formatPrice(waiter.avgCheck)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
