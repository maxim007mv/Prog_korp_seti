import { apiClient } from './client';
import type {
  AiDigestRequest,
  AiDigestResponse,
  AiForecastRequest,
  AiForecastResponse,
  AiRecommendationResponse,
  AiChatRequest,
  AiChatResponse,
  AiRequestHistory,
  DetailedRecommendation,
} from '@/types';

/**
 * API функции для работы с ИИ
 */
export const aiApi = {
  // ============================================
  // ДАЙДЖЕСТЫ
  // ============================================

  /**
   * Генерация дайджеста смены
   */
  generateDigest: (params: AiDigestRequest): Promise<AiDigestResponse> =>
    apiClient.post('/ai/digest', params),

  /**
   * Получение последнего дайджеста
   */
  getLatestDigest: (): Promise<AiDigestResponse> =>
    apiClient.get('/ai/digest/latest'),

  /**
   * Получение дайджеста по дате
   */
  getDigestByDate: (date: string): Promise<AiDigestResponse> =>
    apiClient.get(`/ai/digest/${date}`),

  /**
   * Получение истории дайджестов
   */
  getDigestHistory: (limit = 30): Promise<AiDigestResponse[]> =>
    apiClient.get('/ai/digest/history', { limit }),

  // ============================================
  // ПРОГНОЗИРОВАНИЕ
  // ============================================

  /**
   * Получение прогноза спроса
   */
  getForecast: (params: AiForecastRequest): Promise<AiForecastResponse> =>
    apiClient.post('/ai/forecast', params),

  /**
   * Получение прогноза для конкретного блюда
   */
  getDishForecast: (dishId: number, days = 7): Promise<AiForecastResponse> =>
    apiClient.get(`/ai/forecast/dish/${dishId}`, { days }),

  /**
   * Получение точности прогнозов
   */
  getForecastAccuracy: (): Promise<{ mape: number; accuracy: number }> =>
    apiClient.get('/ai/forecast/accuracy'),

  // ============================================
  // РЕКОМЕНДАЦИИ
  // ============================================

  /**
   * Получение рекомендаций
   */
  getRecommendations: (targetRole?: string): Promise<AiRecommendationResponse> =>
    apiClient.get('/ai/recommendations', { targetRole }),

  /**
   * Получение конкретной рекомендации
   */
  getRecommendation: (id: number): Promise<DetailedRecommendation> =>
    apiClient.get(`/ai/recommendations/${id}`),

  /**
   * Отметить рекомендацию как прочитанную
   */
  markRecommendationRead: (id: number): Promise<void> =>
    apiClient.patch(`/ai/recommendations/${id}/read`),

  /**
   * Отклонить рекомендацию
   */
  dismissRecommendation: (id: number): Promise<void> =>
    apiClient.delete(`/ai/recommendations/${id}`),

  /**
   * Применить рекомендацию
   */
  applyRecommendation: (id: number): Promise<void> =>
    apiClient.post(`/ai/recommendations/${id}/apply`),

  // ============================================
  // ЧАТ-АССИСТЕНТ
  // ============================================

  /**
   * Отправить сообщение в чат
   */
  chat: (params: AiChatRequest): Promise<AiChatResponse> =>
    apiClient.post('/ai/chat', params),

  /**
   * Получение истории чата
   */
  getChatHistory: (limit = 50): Promise<any[]> =>
    apiClient.get('/ai/chat/history', { limit }),

  /**
   * Очистить историю чата
   */
  clearChatHistory: (): Promise<void> =>
    apiClient.delete('/ai/chat/history'),

  // ============================================
  // ИСТОРИЯ И СТАТИСТИКА
  // ============================================

  /**
   * История всех ИИ-запросов
   */
  getHistory: (limit = 20): Promise<AiRequestHistory[]> =>
    apiClient.get('/ai/history', { limit }),

  /**
   * Статистика использования ИИ
   */
  getStats: (): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    requestsByType: Record<string, number>;
    avgResponseTime: number;
  }> =>
    apiClient.get('/ai/stats'),

  /**
   * Стоимость ИИ за период
   */
  getCostReport: (startDate: string, endDate: string): Promise<{
    totalCost: number;
    breakdown: Array<{
      date: string;
      requests: number;
      tokens: number;
      cost: number;
    }>;
  }> =>
    apiClient.get('/ai/cost', { startDate, endDate }),

  // ============================================
  // УТИЛИТЫ
  // ============================================

  /**
   * Проверка доступности ИИ-сервиса
   */
  checkHealth: (): Promise<{ status: 'ok' | 'error'; message?: string }> =>
    apiClient.get('/ai/health'),

  /**
   * Генерация отчета с помощью ИИ
   */
  generateReport: (type: string, params: any): Promise<{ report: string; data: any }> =>
    apiClient.post(`/ai/generate-report/${type}`, params),

  // ============================================
  // ПРЕДСКАЗАНИЯ
  // ============================================

  /**
   * Получить AI предсказания загрузки столиков на неделю
   */
  getTablePredictions: (): Promise<{
    predictions: Array<{
      date: string;
      dayOfWeek: string;
      avgOccupancyRate: number;
      hourlyPredictions: Array<{
        hour: number;
        occupancyRate: number;
        expectedOrders: number;
        confidence: number;
      }>;
      expectedRevenue: number;
      topTables: Array<{ tableId: number; expectedOrders: number }>;
    }>;
    topTables: Array<{
      tableId: number;
      totalOrders: number;
      totalRevenue: number;
      avgRevenue: number;
      peakHours: number[];
      peakDays: string[];
    }>;
    mostPopularDish: string;
    generatedAt: string;
  }> =>
    apiClient.get('/ai/predictions/tables'),
};

/**
 * Экспорт для обратной совместимости
 */
export default aiApi;
