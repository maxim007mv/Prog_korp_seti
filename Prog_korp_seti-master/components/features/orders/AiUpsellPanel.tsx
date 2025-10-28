'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui';
import { getUpsellSuggestions } from '@/lib/ai/deepseek';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types/order';
import type { Dish } from '@/types/dish';
import type { AiUpsellSuggestion } from '@/types/ai';

interface AiUpsellPanelProps {
  order: Order;
  allDishes: Dish[];
  onAddDish: (dishId: number) => void;
}

/**
 * AI панель для рекомендаций допродаж
 * Анализирует текущий заказ и предлагает дополнительные блюда
 */
export function AiUpsellPanel({ order, allDishes, onAddDish }: AiUpsellPanelProps) {
  const [suggestions, setSuggestions] = useState<AiUpsellSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузить рекомендации при изменении заказа
  useEffect(() => {
    // Не загружать если заказ пустой
    if (!order.items || order.items.length === 0) {
      setSuggestions([]);
      return;
    }

    loadSuggestions();
  }, [order.items?.length]); // Перезагрузить при изменении количества позиций

  const loadSuggestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getUpsellSuggestions(order, allDishes);
      setSuggestions(result.suggestions);
    } catch (err) {
      console.error('Failed to load AI upsell suggestions:', err);
      setError('Не удалось загрузить рекомендации');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Если нет позиций в заказе, не показываем панель
  if (!order.items || order.items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 p-6 border border-accent/20">
      {/* Заголовок */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-gray-900">AI Рекомендации</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadSuggestions}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Обновить'
          )}
        </Button>
      </div>

      {/* Состояния загрузки */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-3 text-gray-600">Анализирую заказ...</span>
        </div>
      )}

      {/* Ошибка */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Рекомендации */}
      {!isLoading && !error && suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Изображение блюда */}
                {suggestion.dish?.imageUrl && (
                  <img
                    src={suggestion.dish.imageUrl}
                    alt={suggestion.dish.name}
                    className="h-16 w-16 rounded-lg object-cover"
                    onError={(e) => {
                      // Fallback на placeholder при ошибке загрузки
                      (e.target as HTMLImageElement).src = '/images/dishes/dish_1.jpg';
                    }}
                  />
                )}

                {/* Информация */}
                <div className="flex-1">
                  <div className="mb-1 flex items-start justify-between">
                    <h4 className="font-medium text-gray-900">
                      {suggestion.dish?.name || 'Блюдо #' + suggestion.dishId}
                    </h4>
                    {suggestion.dish?.price && (
                      <span className="text-sm font-semibold text-accent">
                        {formatPrice(suggestion.dish.price)}
                      </span>
                    )}
                  </div>

                  {/* Причина рекомендации */}
                  <p className="mb-3 text-sm text-gray-600">
                    {suggestion.reason}
                  </p>

                  {/* Уверенность */}
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{
                            width: `${(suggestion.confidence || 0) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round((suggestion.confidence || 0) * 100)}%
                    </span>
                  </div>

                  {/* Кнопка добавления */}
                  <Button
                    size="sm"
                    onClick={() => onAddDish(suggestion.dishId)}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить в заказ
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Нет рекомендаций */}
      {!isLoading && !error && suggestions.length === 0 && (
        <div className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-600">
          <Sparkles className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p>Пока нет рекомендаций для этого заказа</p>
        </div>
      )}
    </div>
  );
}
