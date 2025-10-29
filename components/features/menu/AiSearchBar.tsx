'use client';

import React, { useState } from 'react';
import { Sparkles, Mic, Search, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { searchMenuWithAI } from '@/lib/ai/deepseek';
import type { Dish } from '@/types/dish';

interface AiSearchBarProps {
  allDishes: Dish[];
  onSearchResults: (dishIds: number[], explanation: string) => void;
}

/**
 * AI-поиск по меню с NLP
 * Примеры запросов: "хочу без глютена до 700₽", "острое мясо", "легкий салат"
 */
export function AiSearchBar({ allDishes, onSearchResults }: AiSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [explanation, setExplanation] = useState('');

  // Голосовой ввод (Web Speech API)
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Голосовой ввод не поддерживается в вашем браузере');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert('Ошибка распознавания речи');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Поиск через AI
  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setExplanation('');

    try {
      const result = await searchMenuWithAI(query, allDishes);
      setExplanation(result.explanation || '');
      onSearchResults(result.dishes, result.explanation || '');
    } catch (error) {
      console.error('AI search failed:', error);
      setExplanation('Ошибка поиска. Попробуйте переформулировать запрос.');
      onSearchResults([], '');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-3">
      {/* Заголовок */}
      <div className="flex items-center gap-2 text-accent">
        <Sparkles className="h-5 w-5" />
        <h3 className="font-semibold">AI-поиск по меню</h3>
      </div>

      {/* Поле ввода */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Например: 'хочу без глютена до 700₽' или 'острое мясо'"
            disabled={isSearching || isListening}
            className="pr-12"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={startVoiceInput}
            disabled={isSearching || isListening}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            title="Голосовой ввод"
          >
            <Mic
              className={`h-4 w-4 ${isListening ? 'text-red-500 animate-pulse' : ''}`}
            />
          </Button>
        </div>

        <Button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="min-w-[100px]"
        >
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ищу...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Найти
            </>
          )}
        </Button>
      </div>

      {/* Объяснение результатов */}
      {explanation && (
        <div className="rounded-lg bg-accent/10 p-3 text-sm">
          <p className="text-gray-700">{explanation}</p>
        </div>
      )}

      {/* Примеры запросов */}
      {!explanation && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">Примеры:</span>
          {[
            'без глютена до 700₽',
            'острое мясо',
            'легкий салат',
            'десерт с шоколадом',
          ].map((example) => (
            <button
              key={example}
              onClick={() => setQuery(example)}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
