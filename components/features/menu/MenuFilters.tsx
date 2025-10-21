'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input, Button, Badge } from '@/components/ui';
import { DISH_TAGS } from '@/constants';

interface MenuFiltersProps {
  onSearchChange: (search: string) => void;
  onTagsChange: (tags: string[]) => void;
  onPriceChange: (min: number, max: number) => void;
}

export function MenuFilters({
  onSearchChange,
  onTagsChange,
  onPriceChange,
}: MenuFiltersProps) {
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    onTagsChange(newTags);
  };

  const handlePriceChange = () => {
    const min = priceMin ? Number(priceMin) : 0;
    const max = priceMax ? Number(priceMax) : Infinity;
    onPriceChange(min, max);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedTags([]);
    setPriceMin('');
    setPriceMax('');
    onSearchChange('');
    onTagsChange([]);
    onPriceChange(0, Infinity);
  };

  return (
    <div className="space-y-4">
      {/* Поиск */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Поиск блюд..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-5 w-5" />
          Фильтры
        </Button>
      </div>

      {/* Расширенные фильтры */}
      {showFilters && (
        <div className="animate-slide-up rounded-xl border border-gray-200 bg-white p-4">
          {/* Теги */}
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium text-gray-700">Теги</h4>
            <div className="flex flex-wrap gap-2">
              {DISH_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={selectedTags.includes(tag) ? 'opacity-100' : 'opacity-50'}
                >
                  <Badge
                    variant={selectedTags.includes(tag) ? 'info' : 'default'}
                  >
                    {tag}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Цена */}
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium text-gray-700">Цена, ₽</h4>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="От"
                value={priceMin}
                onChange={(e) => {
                  setPriceMin(e.target.value);
                  if (e.target.value || priceMax) {
                    handlePriceChange();
                  }
                }}
                min="0"
              />
              <Input
                type="number"
                placeholder="До"
                value={priceMax}
                onChange={(e) => {
                  setPriceMax(e.target.value);
                  if (priceMin || e.target.value) {
                    handlePriceChange();
                  }
                }}
                min="0"
              />
            </div>
          </div>

          {/* Очистить фильтры */}
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="w-full gap-2"
          >
            <X className="h-4 w-4" />
            Очистить фильтры
          </Button>
        </div>
      )}
    </div>
  );
}
