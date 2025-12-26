'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { GlassCard, Input, Badge } from '@/components/ui';
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
    if (!confirm('Удалить это блюдо? Это действие нельзя отменить.')) return;
    try {
      await deleteDishMutation.mutateAsync(dishId);
      alert('Блюдо удалено!');
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-[24px] bg-white/5 backdrop-blur" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-8 text-center rounded-[24px]">
        <p className="text-red-400 font-bold">Ошибка загрузки меню</p>
        <p className="mt-2 text-sm text-red-300">{error.message}</p>
      </GlassCard>
    );
  }

  const filteredDishes = menuData?.dishes.filter((dish) => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dish.composition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || dish.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 rounded-[24px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">Управление меню</h1>
            <p className="mt-2 text-white/70">Всего блюд: {menuData?.dishes.length || 0}</p>
          </div>
          <button className="px-4 py-2 rounded-xl text-sm bg-amber-400/30 border border-amber-400/50 text-amber-300 hover:bg-amber-400/40 transition-colors flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Добавить блюдо
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-6 rounded-[24px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
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
            <label className="mb-2 block text-sm font-medium text-white/80">Категория</label>
            <select
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-white/90 focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as DishCategory | '')}
            >
              <option value="" className="bg-gray-800">Все категории</option>
              {DISH_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-800">
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDishes.map((dish) => (
          <GlassCard key={dish.id} className="p-6 rounded-[24px]">
            <div className="mb-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold text-white">{dish.name}</h3>
                <Badge variant="info">{CATEGORY_LABELS[dish.category]}</Badge>
              </div>
              <p className="text-sm text-white/60 mb-3">{dish.composition}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-white/60">Цена:</span>
                  <p className="font-bold text-amber-400">{formatPrice(dish.price)}</p>
                </div>
                <div>
                  <span className="text-white/60">Время:</span>
                  <p className="font-bold text-white">{formatCookingTime(dish.cookingTime)}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 rounded-xl text-sm bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                <Edit className="h-4 w-4" />
                Изменить
              </button>
              <button 
                className="flex-1 px-3 py-2 rounded-xl text-sm bg-red-400/20 border border-red-400/50 text-red-300 hover:bg-red-400/30 transition-colors flex items-center justify-center gap-2"
                onClick={() => handleDelete(dish.id)}
              >
                <Trash2 className="h-4 w-4" />
                Удалить
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {filteredDishes.length === 0 && (
        <GlassCard className="p-8 text-center rounded-[24px]">
          <p className="text-white/70">
            {searchQuery || selectedCategory ? 'Нет блюд по заданным фильтрам' : 'Нет блюд в меню'}
          </p>
        </GlassCard>
      )}
    </div>
  );
}
