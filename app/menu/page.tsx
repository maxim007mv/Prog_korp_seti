'use client';

import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useMenu } from '@/lib/hooks';
import { DishCard, MenuCategoryTabs, MenuFilters } from '@/components/features/menu';
import { AiSearchBar } from '@/components/features/menu/AiSearchBar';
import { SkeletonCard } from '@/components/ui';
import type { DishCategory, Dish } from '@/types';

export default function MenuPage() {
  const { data: menuData, isLoading, error } = useMenu();
  const [activeCategory, setActiveCategory] = useState<DishCategory | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: Infinity,
  });
  const [aiFilteredIds, setAiFilteredIds] = useState<number[] | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'>('default');

  // Обработка AI результатов
  const handleAiSearchResults = (dishIds: number[], explanation: string) => {
    setAiFilteredIds(dishIds.length > 0 ? dishIds : null);
    // Сбросить другие фильтры при AI поиске
    if (dishIds.length > 0) {
      setActiveCategory(undefined);
      setSearchQuery('');
      setSelectedTags([]);
    }
  };

  // Фильтрация блюд
  const filteredDishes = useMemo(() => {
    if (!menuData?.dishes) return [];

    const source = aiFilteredIds !== null
      ? menuData.dishes.filter((dish: Dish) => aiFilteredIds.includes(dish.id))
      : menuData.dishes;

    const filtered = source.filter((dish: Dish) => {
      // Фильтр по категории
      if (activeCategory && dish.category !== activeCategory) {
        return false;
      }

      // Фильтр по поиску
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = dish.name.toLowerCase().includes(query);
        const matchComposition = dish.composition.toLowerCase().includes(query);
        if (!matchName && !matchComposition) {
          return false;
        }
      }

      // Фильтр по тегам
      if (selectedTags.length > 0) {
        const hasMatchingTag = selectedTags.some((tag) =>
          dish.tags?.includes(tag)
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      // Фильтр по цене
      if (dish.price < priceRange.min || dish.price > priceRange.max) {
        return false;
      }

      return true;
    });

    // Сортировка
    const sorted = [...filtered];
    switch (sortBy) {
      case 'price_asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        break;
      case 'name_desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
        break;
      default:
        // по умолчанию: как пришло с бэка (сейчас по имени ASC)
        break;
    }
    return sorted;
  }, [menuData, activeCategory, searchQuery, selectedTags, priceRange, aiFilteredIds, sortBy]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="rounded-2xl bg-white p-8 text-center shadow-soft">
            <p className="text-red-600 mb-4">
              Ошибка загрузки меню. Проверьте подключение к серверу.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary px-6 py-2 rounded-lg"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MenuCategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <div className="container-custom py-8">
        <h1 className="mb-6 text-4xl font-bold">Меню</h1>

        {/* AI Поиск */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-soft">
          <AiSearchBar
            allDishes={menuData?.dishes || []}
            onSearchResults={handleAiSearchResults}
          />
        </div>

        {/* Обычные фильтры */}
        <MenuFilters
          onSearchChange={setSearchQuery}
          onTagsChange={setSelectedTags}
          onPriceChange={(min, max) => setPriceRange({ min, max })}
          onSortChange={setSortBy}
        />

        {isLoading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-soft">
            <p className="text-gray-600">
              Блюда не найдены. Попробуйте изменить фильтры.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDishes.map((dish: Dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
