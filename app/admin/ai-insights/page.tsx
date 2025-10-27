'use client';

import { useLatestDigest, useRecommendations } from '@/lib/hooks';
import { GlassCard, Button, Badge } from '@/components/ui';
import { TrendingUp, TrendingDown, Brain, Sparkles, AlertCircle, CheckCircle, Clock, ChefHat } from 'lucide-react';

export default function AiInsightsPage() {
  const { data: digest, isLoading, error } = useLatestDigest();
  const { data: recommendations } = useRecommendations('admin');

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
      {/* Заголовок */}
      <GlassCard className="p-6 rounded-[24px]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              <Brain className="h-8 w-8 text-amber-400" />
              ИИ-Аналитика
            </h1>
            <p className="text-white/70 mt-2">
              Умные инсайты и рекомендации на основе ваших данных
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl text-sm bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-colors flex items-center gap-2">
              <Clock className="h-4 w-4" />
              История
            </button>
            <button className="px-4 py-2 rounded-xl text-sm bg-amber-400/30 border border-amber-400/50 text-amber-300 hover:bg-amber-400/40 transition-colors flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Обновить
            </button>
          </div>
        </div>
      </GlassCard>

      {/* KPI карточки */}
      {digest && digest.metrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <GlassCard className="p-6 rounded-[24px]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-white/60 uppercase tracking-wider">Выручка (30 дней)</p>
                <p className="text-2xl font-bold mt-2 text-white">{digest.metrics.revenue.toLocaleString('ru-RU')} ₽</p>
                {digest.metrics.growth && (
                  <div className={`flex items-center gap-1 mt-2 text-sm ${digest.metrics.growth.revenue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {digest.metrics.growth.revenue >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span>{Math.abs(digest.metrics.growth.revenue).toFixed(1)}%</span>
                  </div>
                )}
              </div>
              <div className="h-14 w-14 rounded-2xl bg-amber-400/20 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-amber-400" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 rounded-[24px]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-white/60 uppercase tracking-wider">Заказов</p>
                <p className="text-2xl font-bold mt-2 text-white">{digest.metrics.orderCount}</p>
                {digest.metrics.growth && (
                  <div className={`flex items-center gap-1 mt-2 text-sm ${digest.metrics.growth.orders >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {digest.metrics.growth.orders >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span>{Math.abs(digest.metrics.growth.orders).toFixed(1)}%</span>
                  </div>
                )}
              </div>
              <div className="h-14 w-14 rounded-2xl bg-blue-400/20 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-blue-400" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 rounded-[24px]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-white/60 uppercase tracking-wider">Средний чек</p>
                <p className="text-2xl font-bold mt-2 text-white">{Math.round(digest.metrics.avgCheck).toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-green-400/20 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-green-400" />
              </div>
            </div>
          </GlassCard>

          {digest.forecast?.tomorrow && (
            <GlassCard className="p-6 rounded-[24px]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-white/60 uppercase tracking-wider">Прогноз завтра</p>
                  <p className="text-2xl font-bold mt-2 text-white">{Math.round(digest.forecast.tomorrow.expectedRevenue).toLocaleString('ru-RU')} ₽</p>
                  {digest.forecast.tomorrow.confidence && (
                    <div className="mt-2 px-2 py-1 rounded-lg bg-blue-400/20 text-blue-300 text-xs inline-block">
                      Уверенность: {(digest.forecast.tomorrow.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
                <div className="h-14 w-14 rounded-2xl bg-purple-400/20 flex items-center justify-center">
                  <Brain className="h-7 w-7 text-purple-400" />
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* ИИ-Инсайты */}
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

      {/* Рекомендации */}
      {recommendations?.recommendations && recommendations.recommendations.length > 0 && (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white uppercase tracking-wider">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Рекомендации ИИ
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.recommendations.map((rec) => {
              const priorityColors: Record<string, string> = {
                'high': 'bg-red-400/20 border-red-400/50 text-red-300',
                'medium': 'bg-yellow-400/20 border-yellow-400/50 text-yellow-300',
                'low': 'bg-blue-400/20 border-blue-400/50 text-blue-300',
                '1': 'bg-red-400/20 border-red-400/50 text-red-300',
                '2': 'bg-yellow-400/20 border-yellow-400/50 text-yellow-300',
                '3': 'bg-blue-400/20 border-blue-400/50 text-blue-300',
              };
              const priorityColor = priorityColors[rec.priority] || priorityColors['3'];
              
              return (
                <GlassCard key={rec.id} className={`p-6 rounded-[24px] border-l-4 ${priorityColor}`}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold flex-1 text-white">{rec.title}</h3>
                    <span className={`px-2 py-1 rounded-lg text-xs ${priorityColor}`}>
                      {rec.priority === 1 || rec.priority === 'high' ? 'Срочно' : 
                       rec.priority === 2 || rec.priority === 'medium' ? 'Важно' : 'Рекомендация'}
                    </span>
                  </div>
                  <p className="text-white/70 mb-4">{rec.description || ''}</p>
                  {rec.actionItems && rec.actionItems.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-semibold text-white/60 uppercase tracking-wider">Действия:</p>
                      <ul className="space-y-1">
                        {rec.actionItems.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                            <span className="text-amber-400 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    {rec.confidence && (
                      <span className="text-xs text-white/50">
                        Уверенность: {(rec.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                    <div className="flex gap-2 ml-auto">
                      <button className="px-3 py-1 rounded-lg text-sm bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-colors">
                        Отклонить
                      </button>
                      <button className="px-3 py-1 rounded-lg text-sm bg-amber-400/30 border border-amber-400/50 text-amber-300 hover:bg-amber-400/40 transition-colors">
                        Применить
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Топ блюда */}
      {digest?.topDishes && digest.topDishes.length > 0 && (
        <GlassCard className="p-6 rounded-[24px]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white uppercase tracking-wider">
            <ChefHat className="h-5 w-5 text-amber-400" />
            Топ-5 блюд
          </h2>
          <div className="space-y-3">
            {digest.topDishes.map((dish, idx) => (
              <div
                key={dish.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-white/30">#{idx + 1}</span>
                  <div>
                    <p className="font-semibold text-white">{dish.name}</p>
                    <p className="text-sm text-white/60">{dish.count} заказов</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-400">{dish.revenue.toLocaleString('ru-RU')} ₽</p>
                  <p className="text-xs text-white/50">
                    {((dish.revenue / digest.metrics.revenue) * 100).toFixed(1)}% от выручки
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
