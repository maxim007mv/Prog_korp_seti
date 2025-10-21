'use client';

import { cn } from '@/lib/utils';
import { CATEGORY_LABELS, DISH_CATEGORIES } from '@/constants';
import type { DishCategory } from '@/types';

interface MenuCategoryTabsProps {
  activeCategory?: DishCategory;
  onCategoryChange: (category: DishCategory | undefined) => void;
}

export function MenuCategoryTabs({
  activeCategory,
  onCategoryChange,
}: MenuCategoryTabsProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="container-custom py-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => onCategoryChange(undefined)}
            className={cn(
              'whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors min-w-touch',
              !activeCategory
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Все блюда
          </button>

          {DISH_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={cn(
                'whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors min-w-touch',
                activeCategory === category
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
