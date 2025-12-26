'use client';

import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
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

export function KpiCard({ title, value, icon: Icon, trend, subtitle }: KpiCardProps) {
  return (
    <LiquidGlass className="p-6 rounded-[24px]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/70 uppercase tracking-wider">{title}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="mt-2 text-sm text-white/60">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-3 flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-white/50">vs прошлый период</span>
            </div>
          )}
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/20 shadow-lg shadow-amber-400/10">
          <Icon className="h-7 w-7 text-amber-400" />
        </div>
      </div>
    </LiquidGlass>
  );
}

