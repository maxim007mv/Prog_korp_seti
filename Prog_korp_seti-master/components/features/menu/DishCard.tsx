'use client';

import { Clock } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { formatPrice, formatCookingTime } from '@/lib/utils';
import type { Dish } from '@/types';

interface DishCardProps {
  dish: Dish;
  onSelect?: (dish: Dish) => void;
}

export function DishCard({ dish, onSelect }: DishCardProps) {
  return (
    <Card
      hoverable={!!onSelect}
      onClick={() => onSelect?.(dish)}
      className="overflow-hidden"
    >
      {dish.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-gray-100">
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
            onError={(e) => {
              // Fallback на placeholder при ошибке загрузки
              (e.target as HTMLImageElement).src = '/images/dishes/dish_1.jpg';
            }}
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{dish.name}</h3>
          <span className="text-lg font-bold text-accent">
            {formatPrice(dish.price)}
          </span>
        </div>

        <p className="mb-3 text-sm text-gray-600 line-clamp-2">
          {dish.composition}
        </p>

        <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
          <span>{dish.weight} г</span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatCookingTime(dish.cookingTime)}
          </span>
        </div>

        {dish.tags && dish.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {dish.tags.map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
