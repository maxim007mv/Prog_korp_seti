'use client';

import { Card } from '@/components/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatPrice } from '@/lib/utils';
import type { RevenueReport } from '@/types';

interface RevenueChartProps {
  data: RevenueReport;
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
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-bold">Выручка по дням</h2>
        <p className="mt-1 text-sm text-gray-600">
          Динамика выручки и среднего чека
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
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
            formatter={(value: number, name: string) => {
              if (name === 'revenue' || name === 'avgCheck') {
                return [formatPrice(value), name === 'revenue' ? 'Выручка' : 'Средний чек'];
              }
              return [value, 'Заказов'];
            }}
          />
          <Legend 
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
            strokeWidth={2}
            dot={{ fill: '#FFB84A', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="avgCheck"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ fill: '#8884d8', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
        <div>
          <p className="text-sm text-gray-600">Всего выручка</p>
          <p className="mt-1 text-2xl font-bold text-accent">
            {formatPrice(data.total.revenue)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Всего заказов</p>
          <p className="mt-1 text-2xl font-bold">{data.total.orders}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Средний чек</p>
          <p className="mt-1 text-2xl font-bold">
            {formatPrice(data.total.avgCheck)}
          </p>
        </div>
      </div>
    </Card>
  );
}
