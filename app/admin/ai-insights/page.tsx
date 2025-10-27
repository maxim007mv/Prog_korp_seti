'use client';

import { useState } from 'react';
import { useLatestDigest, useRecommendations } from '@/lib/hooks';
import { Card, Button, Badge } from '@/components/ui';
import { TrendingUp, TrendingDown, Brain, Sparkles, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { AiChatWidget } from '@/components/features/ai/AiChatWidget';

export default function AiInsightsPage() {
  const { data: digest, isLoading, error } = useLatestDigest();
  const { data: recommendations } = useRecommendations('admin');

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Ошибка загрузки данных</h2>
          <p className="text-gray-600">Не удалось загрузить ИИ-аналитику</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-accent" />
            ИИ-Аналитика
          </h1>
          <p className="text-gray-600 mt-1">
            Умные инсайты и рекомендации на основе ваших данных
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            История
          </Button>
          <Button variant="primary">
            <Sparkles className="mr-2 h-4 w-4" />
            Обновить
          </Button>
        </div>
      </div>

      {/* KPI карточки */}
      {digest && digest.metrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard
            title="Выручка (15 дней)"
            value={`${digest.metrics.revenue.toLocaleString('ru-RU')} ₽`}
            change={digest.metrics.growth.revenue}
            icon={TrendingUp}
            trend={digest.metrics.growth.revenue >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            title="Заказов"
            value={digest.metrics.orderCount}
            change={digest.metrics.growth.orders}
            icon={TrendingUp}
            trend={digest.metrics.growth.orders >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            title="Средний чек"
            value={`${Math.round(digest.metrics.avgCheck).toLocaleString('ru-RU')} ₽`}
            change={0}
            icon={TrendingUp}
            trend="stable"
          />
          {digest.forecast && digest.forecast.tomorrow && (
            <MetricCard
              title="Прогноз завтра"
              value={`${Math.round(digest.forecast.tomorrow.expectedRevenue).toLocaleString('ru-RU')} ₽`}
              confidence={digest.forecast.tomorrow.confidence}
              icon={Brain}
              trend="stable"
            />
          )}
        </div>
      )}

      {/* ИИ-Инсайты */}
      {digest && digest.insights && digest.insights.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Ключевые инсайты
            </h2>
            <div className="space-y-3">
              {digest.insights.map((insight, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg hover:bg-accent/10 transition"
                >
                  <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent font-semibold text-sm">{idx + 1}</span>
                  </div>
                  <p className="text-gray-700 flex-1">{insight}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Рекомендации */}
      {recommendations && recommendations.recommendations && recommendations.recommendations.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-accent" />
            Рекомендации ИИ
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.recommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Топ блюда */}
      {digest && digest.topDishes && digest.topDishes.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Топ-5 блюд сегодня</h2>
            <div className="space-y-3">
              {digest.topDishes.map((dish, idx) => (
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-300">#{idx + 1}</span>
                    <div>
                      <p className="font-semibold">{dish.name}</p>
                      <p className="text-sm text-gray-600">{dish.count} заказов</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">{dish.revenue.toLocaleString('ru-RU')} ₽</p>
                    <p className="text-xs text-gray-500">
                      {(dish.revenue / digest.metrics.revenue * 100).toFixed(1)}% от выручки
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Чат-виджет */}
      <AiChatWidget />
    </div>
  );
}

// Компонент метрики
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  confidence?: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'stable';
}

function MetricCard({ title, value, change, confidence, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{Math.abs(change).toFixed(1)}%</span>
              <span className="text-gray-500">vs вчера</span>
            </div>
          )}
          
          {confidence !== undefined && (
            <Badge variant="info" className="mt-2">
              Уверенность: {(confidence * 100).toFixed(0)}%
            </Badge>
          )}
        </div>
        
        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
          trend === 'up' ? 'bg-green-100' :
          trend === 'down' ? 'bg-red-100' :
          'bg-accent/10'
        }`}>
          <Icon className={`h-6 w-6 ${
            trend === 'up' ? 'text-green-600' :
            trend === 'down' ? 'text-red-600' :
            'text-accent'
          }`} />
        </div>
      </div>
    </Card>
  );
}

// Компонент рекомендации
interface RecommendationCardProps {
  recommendation: {
    id: number;
    type: string;
    title: string;
    description?: string;
    actionItems?: string[];
    confidence?: number;
    priority: number | string;
  };
}

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const priorityConfig: Record<number | string, { color: string; badge: string; label: string }> = {
    1: { color: 'border-red-500 bg-red-50', badge: 'destructive', label: 'Срочно' },
    2: { color: 'border-yellow-500 bg-yellow-50', badge: 'secondary', label: 'Важно' },
    3: { color: 'border-blue-500 bg-blue-50', badge: 'secondary', label: 'Рекомендация' },
    'high': { color: 'border-red-500 bg-red-50', badge: 'destructive', label: 'Срочно' },
    'medium': { color: 'border-yellow-500 bg-yellow-50', badge: 'secondary', label: 'Важно' },
    'low': { color: 'border-blue-500 bg-blue-50', badge: 'secondary', label: 'Рекомендация' },
  };

  const config = priorityConfig[recommendation.priority] || priorityConfig[3];

  return (
    <Card className={`border-l-4 ${config.color} hover:shadow-lg transition`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold flex-1">{recommendation.title}</h3>
          <Badge variant={config.badge as any}>
            {config.label}
          </Badge>
        </div>
        
        <p className="text-gray-700 mb-4">{recommendation.description || ''}</p>
        
        {recommendation.actionItems && recommendation.actionItems.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-sm font-semibold text-gray-600">Действия:</p>
            <ul className="space-y-1">
              {recommendation.actionItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-accent mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t">
          {recommendation.confidence !== undefined && (
            <span className="text-xs text-gray-500">
              Уверенность: {(recommendation.confidence * 100).toFixed(0)}%
            </span>
          )}
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="ghost">
              Отклонить
            </Button>
            <Button size="sm" variant="primary">
              Применить
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Компонент загрузки
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-20 bg-gray-200 rounded"></div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded"></div>
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded"></div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
}
