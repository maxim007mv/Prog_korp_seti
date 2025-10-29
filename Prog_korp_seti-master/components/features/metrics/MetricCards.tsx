'use client';

import { Card } from '@/components/ui';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down' | 'stable';
  loading?: boolean;
  className?: string;
}

export function KpiCard({
  title,
  value,
  change,
  changeLabel = 'vs вчера',
  icon: Icon,
  iconColor = 'text-accent',
  trend,
  loading,
  className = '',
}: KpiCardProps) {
  if (loading) {
    return (
      <Card className={`p-6 animate-pulse ${className}`}>
        <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
        <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </Card>
    );
  }

  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const iconBgColor = trend === 'up' ? 'bg-green-100' : trend === 'down' ? 'bg-red-100' : 'bg-accent/10';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className={`p-6 hover:shadow-lg transition ${className}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>

            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${trendColor}`}>
                <TrendIcon className="h-4 w-4" />
                <span className="font-medium">{Math.abs(change).toFixed(1)}%</span>
                <span className="text-gray-500">{changeLabel}</span>
              </div>
            )}
          </div>

          {Icon && (
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${iconBgColor}`}>
              <Icon className={`h-6 w-6 ${trend ? trendColor : iconColor}`} />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  className?: string;
}

export function StatCard({ label, value, icon: Icon, color = 'blue', className = '' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className={`flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 ${className}`}>
      {Icon && (
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

interface ProgressCardProps {
  title: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
  className?: string;
}

export function ProgressCard({
  title,
  current,
  target,
  unit = '',
  color = 'bg-accent',
  className = '',
}: ProgressCardProps) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-sm text-gray-600">
          {current.toLocaleString('ru-RU')}{unit} / {target.toLocaleString('ru-RU')}{unit}
        </span>
      </div>
      
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
      
      <p className="text-sm text-gray-600 mt-2">
        {percentage.toFixed(1)}% от цели
      </p>
    </Card>
  );
}

interface ComparisonCardProps {
  title: string;
  current: {
    label: string;
    value: number;
  };
  previous: {
    label: string;
    value: number;
  };
  unit?: string;
  className?: string;
}

export function ComparisonCard({
  title,
  current,
  previous,
  unit = '₽',
  className = '',
}: ComparisonCardProps) {
  const change = ((current.value - previous.value) / previous.value) * 100;
  const isPositive = change >= 0;

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="font-semibold mb-4">{title}</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">{current.label}</p>
          <p className="text-2xl font-bold">{current.value.toLocaleString('ru-RU')}{unit}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600 mb-1">{previous.label}</p>
          <p className="text-2xl font-bold text-gray-400">
            {previous.value.toLocaleString('ru-RU')}{unit}
          </p>
        </div>
      </div>
      
      <div className={`mt-4 p-3 rounded-lg ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className={`flex items-center gap-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          <span className="font-semibold">{Math.abs(change).toFixed(1)}%</span>
          <span className="text-gray-600">
            {isPositive ? 'рост' : 'снижение'} относительно {previous.label.toLowerCase()}
          </span>
        </div>
      </div>
    </Card>
  );
}

interface MiniStatProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
}

export function MiniStat({ label, value, icon: Icon, trend, change }: MiniStatProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-gray-600" />}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold">{value}</span>
        {change !== undefined && trend && (
          <span className={`text-xs ${trendColor}`}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
