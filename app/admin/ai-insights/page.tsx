'use client';

import { useLatestDigest } from '@/lib/hooks';
import { GlassCard } from '@/components/ui';
import { Brain, Sparkles, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

export default function AiInsightsPage() {
  const { data: digest, isLoading, error } = useLatestDigest();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 rounded-[24px] bg-white/5 backdrop-blur animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-8 text-center rounded-[24px]">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-white">Ошибка загрузки данных</h2>
        <p className="text-white/70">Не удалось загрузить ИИ-аналитику</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 rounded-[24px]">
        <h1 className="text-3xl font-bold flex items-center gap-2 uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
          <Brain className="h-8 w-8 text-amber-400" />
          ИИ-Аналитика
        </h1>
        <p className="text-white/70 mt-2">Умные инсайты и рекомендации</p>
      </GlassCard>

      {digest && digest.metrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <GlassCard className="p-6 rounded-[24px]">
            <p className="text-sm text-white/60 uppercase tracking-wider">Выручка (30 дней)</p>
            <p className="text-2xl font-bold mt-2 text-white">{digest.metrics.revenue.toLocaleString('ru-RU')} ₽</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-400">
              <TrendingUp className="h-4 w-4" />
              <span>{digest.metrics.growth.revenue.toFixed(1)}%</span>
            </div>
          </GlassCard>

          <GlassCard className="p-6 rounded-[24px]">
            <p className="text-sm text-white/60 uppercase tracking-wider">Заказов</p>
            <p className="text-2xl font-bold mt-2 text-white">{digest.metrics.orderCount}</p>
          </GlassCard>

          <GlassCard className="p-6 rounded-[24px]">
            <p className="text-sm text-white/60 uppercase tracking-wider">Средний чек</p>
            <p className="text-2xl font-bold mt-2 text-white">{Math.round(digest.metrics.avgCheck).toLocaleString('ru-RU')} ₽</p>
          </GlassCard>

          {digest.forecast?.tomorrow && (
            <GlassCard className="p-6 rounded-[24px]">
              <p className="text-sm text-white/60 uppercase tracking-wider">Прогноз завтра</p>
              <p className="text-2xl font-bold mt-2 text-white">{Math.round(digest.forecast.tomorrow.expectedRevenue).toLocaleString('ru-RU')} ₽</p>
            </GlassCard>
          )}
        </div>
      )}

      {digest?.insights && digest.insights.length > 0 && (
        <GlassCard className="p-6 rounded-[24px]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white uppercase tracking-wider">
            <Sparkles className="h-5 w-5 text-amber-400" />
            Ключевые инсайты
          </h2>
          <div className="space-y-3">
            {digest.insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="h-6 w-6 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 font-semibold text-sm">{idx + 1}</span>
                </div>
                <p className="text-white/80">{insight}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
