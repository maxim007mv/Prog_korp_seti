'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Button, Card, Input, Badge } from '@/components/ui';
import { useMenu, useDeleteDish } from '@/lib/hooks';
import { formatPrice, formatCookingTime } from '@/lib/utils';
import { CATEGORY_LABELS, DISH_CATEGORIES } from '@/constants';
import type { Dish, DishCategory } from '@/types';

export default function AdminMenuPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DishCategory | ''>('');
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  const { data: menuData, isLoading, error } = useMenu();
  const deleteDishMutation = useDeleteDish();

  const handleDelete = async (dishId: number) => {
    if (!confirm('Удалить это блюдо? Это действие нельзя отменить.')) {
      return;
    }

    try {
      await deleteDishMutation.mutateAsync(dishId);
      alert('Блюдо удалено!');
    } catch (err: any) {
      alert(`Ошибка: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Управление меню</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-red-600">Ошибка загрузки меню</p>
          <p className="mt-2 text-sm text-red-500">{error.message}</p>
        </div>
      </div>
    );
  }

  const filteredDishes = menuData?.dishes.filter((dish) => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dish.composition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || dish.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление меню</h1>
          <p className="mt-2 text-gray-600">
            Всего блюд: {menuData?.dishes.length || 0}
          </p>
        </div>
        <Button variant="primary">
          <Plus className="mr-2 h-5 w-5" />
          Добавить блюдо
        </Button>
      </div>

      {/* Фильтры */}
      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              <Search className="mr-2 inline h-4 w-4" />
              Поиск
            </label>
            <Input
              type="text"
              placeholder="Название или состав..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Категория</label>
            <select
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as DishCategory | '')}
            >
              <option value="">Все категории</option>
              {DISH_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Список блюд */}
      {filteredDishes.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600">
            {searchQuery || selectedCategory
              ? 'Нет блюд по заданным фильтрам'
              : 'Нет блюд в меню'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDishes.map((dish) => (
            <Card key={dish.id} className="relative">
              {dish.imageUrl && (
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="mb-4 h-48 w-full rounded-lg object-cover"
                  onError={(e) => {
                    // Fallback на placeholder при ошибке загрузки
                    (e.target as HTMLImageElement).src = '/images/dishes/dish_1.jpg';
                  }}
                />
              )}
              
              <div className="mb-3">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-lg font-bold">{dish.name}</h3>
                  <Badge>{CATEGORY_LABELS[dish.category]}</Badge>
                </div>
                <p className="text-sm text-gray-600">{dish.composition}</p>
              </div>

              <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
                <span>{dish.weight}</span>
                <span>{formatCookingTime(dish.cookingTime)}</span>
              </div>

              <div className="mb-4">
                <p className="text-2xl font-bold text-accent">
                  {formatPrice(dish.price)}
                </p>
              </div>

              {dish.tags && dish.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {dish.tags.map((tag) => (
                    <Badge key={tag}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditingDish(dish)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Изменить
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDelete(dish.id)}
                  disabled={deleteDishMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
