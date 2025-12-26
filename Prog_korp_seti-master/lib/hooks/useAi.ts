'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import type {
  AiDigestRequest,
  AiDigestResponse,
  AiForecastRequest,
  AiChatRequest,
} from '@/types';

/**
 * Хук для получения последнего дайджеста
 */
export function useLatestDigest() {
  return useQuery({
    queryKey: ['ai', 'digest', 'latest'],
    queryFn: aiApi.getLatestDigest,
    staleTime: 5 * 60 * 1000, // 5 минут
    refetchInterval: 5 * 60 * 1000, // обновление каждые 5 минут
  });
}

/**
 * Хук для получения дайджеста по дате
 */
export function useDigestByDate(date: string) {
  return useQuery({
    queryKey: ['ai', 'digest', date],
    queryFn: () => aiApi.getDigestByDate(date),
    enabled: !!date,
    staleTime: 10 * 60 * 1000, // 10 минут
  });
}

/**
 * Хук для генерации дайджеста
 */
export function useGenerateDigest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: AiDigestRequest) => aiApi.generateDigest(params),
    onSuccess: (data) => {
      // Обновляем кеш последнего дайджеста
      queryClient.setQueryData(['ai', 'digest', 'latest'], data);
      queryClient.setQueryData(['ai', 'digest', data.date], data);
      
      // Инвалидируем историю дайджестов
      queryClient.invalidateQueries({ queryKey: ['ai', 'digest', 'history'] });
    },
  });
}

/**
 * Хук для получения истории дайджестов
 */
export function useDigestHistory(limit = 30) {
  return useQuery({
    queryKey: ['ai', 'digest', 'history', limit],
    queryFn: () => aiApi.getDigestHistory(limit),
    staleTime: 15 * 60 * 1000, // 15 минут
  });
}

/**
 * Хук для получения прогноза
 */
export function useForecast(params: AiForecastRequest, enabled = true) {
  return useQuery({
    queryKey: ['ai', 'forecast', params],
    queryFn: () => aiApi.getForecast(params),
    enabled,
    staleTime: 60 * 60 * 1000, // 1 час
  });
}

/**
 * Хук для получения прогноза блюда
 */
export function useDishForecast(dishId: number, days = 7) {
  return useQuery({
    queryKey: ['ai', 'forecast', 'dish', dishId, days],
    queryFn: () => aiApi.getDishForecast(dishId, days),
    enabled: !!dishId,
    staleTime: 60 * 60 * 1000, // 1 час
  });
}

/**
 * Хук для получения точности прогнозов
 */
export function useForecastAccuracy() {
  return useQuery({
    queryKey: ['ai', 'forecast', 'accuracy'],
    queryFn: aiApi.getForecastAccuracy,
    staleTime: 60 * 60 * 1000, // 1 час
    refetchInterval: 60 * 60 * 1000, // обновление каждый час
  });
}

/**
 * Хук для получения рекомендаций
 */
export function useRecommendations(targetRole?: string) {
  return useQuery({
    queryKey: ['ai', 'recommendations', targetRole],
    queryFn: () => aiApi.getRecommendations(targetRole),
    staleTime: 10 * 60 * 1000, // 10 минут
    refetchInterval: 10 * 60 * 1000, // обновление каждые 10 минут
  });
}

/**
 * Хук для получения конкретной рекомендации
 */
export function useRecommendation(id: number) {
  return useQuery({
    queryKey: ['ai', 'recommendation', id],
    queryFn: () => aiApi.getRecommendation(id),
    enabled: !!id,
  });
}

/**
 * Хук для отметки рекомендации как прочитанной
 */
export function useMarkRecommendationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => aiApi.markRecommendationRead(id),
    onSuccess: (_, id) => {
      // Обновляем рекомендацию в кеше
      queryClient.invalidateQueries({ queryKey: ['ai', 'recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['ai', 'recommendation', id] });
    },
  });
}

/**
 * Хук для отклонения рекомендации
 */
export function useDismissRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => aiApi.dismissRecommendation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'recommendations'] });
    },
  });
}

/**
 * Хук для применения рекомендации
 */
export function useApplyRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => aiApi.applyRecommendation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'recommendations'] });
    },
  });
}

/**
 * Хук для чата с ИИ
 */
export function useAiChat() {
  return useMutation({
    mutationFn: (params: AiChatRequest) => aiApi.chat(params),
  });
}

/**
 * Хук для получения истории чата
 */
export function useChatHistory(limit = 50) {
  return useQuery({
    queryKey: ['ai', 'chat', 'history', limit],
    queryFn: () => aiApi.getChatHistory(limit),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

/**
 * Хук для очистки истории чата
 */
export function useClearChatHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: aiApi.clearChatHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'chat', 'history'] });
    },
  });
}

/**
 * Хук для получения истории ИИ-запросов
 */
export function useAiHistory(limit = 20) {
  return useQuery({
    queryKey: ['ai', 'history', limit],
    queryFn: () => aiApi.getHistory(limit),
    staleTime: 15 * 60 * 1000, // 15 минут
  });
}

/**
 * Хук для получения статистики ИИ
 */
export function useAiStats() {
  return useQuery({
    queryKey: ['ai', 'stats'],
    queryFn: aiApi.getStats,
    staleTime: 30 * 60 * 1000, // 30 минут
    refetchInterval: 30 * 60 * 1000,
  });
}

/**
 * Хук для получения отчета по стоимости ИИ
 */
export function useAiCostReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['ai', 'cost', startDate, endDate],
    queryFn: () => aiApi.getCostReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 60 * 60 * 1000, // 1 час
  });
}

/**
 * Хук для проверки здоровья ИИ-сервиса
 */
export function useAiHealth() {
  return useQuery({
    queryKey: ['ai', 'health'],
    queryFn: aiApi.checkHealth,
    staleTime: 60 * 1000, // 1 минута
    refetchInterval: 60 * 1000, // обновление каждую минуту
    retry: 1,
  });
}

/**
 * Хук для генерации отчета с помощью ИИ
 */
export function useGenerateAiReport() {
  return useMutation({
    mutationFn: ({ type, params }: { type: string; params: any }) =>
      aiApi.generateReport(type, params),
  });
}
