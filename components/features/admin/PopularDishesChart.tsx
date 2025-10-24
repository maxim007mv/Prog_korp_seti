'use client';

import { Card } from '@/components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatPrice } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/constants';
import type { PopularDishesReport } from '@/types';

interface PopularDishesChartProps {
  data: PopularDishesReport;
}

const COLORS = ['#FFB84A', '#FF8042', '#00C49F', '#0088FE', '#FFBB28'];

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
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-bold">Топ-5 популярных блюд</h2>
        <p className="mt-1 text-sm text-gray-600">
          По количеству заказов за период
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 12 }} stroke="#666" />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={150}
            tick={{ fontSize: 12 }}
            stroke="#666"
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
                  <p className="font-semibold">{data.fullName}</p>
                  <p className="text-sm text-gray-600">{data.category}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>Заказано: <span className="font-semibold">{data.qty} раз</span></p>
                    <p>Выручка: <span className="font-semibold">{formatPrice(data.revenue)}</span></p>
                    <p>Доля: <span className="font-semibold">{data.share.toFixed(1)}%</span></p>
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

      <div className="mt-6 border-t pt-4">
        <div className="space-y-2">
          {topDishes.map((dish, index) => (
            <div key={dish.dishId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div>
                  <p className="text-sm font-medium">{dish.name}</p>
                  <p className="text-xs text-gray-500">{CATEGORY_LABELS[dish.category]}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{dish.qty} заказов</p>
                <p className="text-xs text-gray-500">{dish.share.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
