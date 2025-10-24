/**
 * AI предложения для upsell
 */
export interface AiUpsellSuggestion {
  dishId: number;
  dish?: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
  };
  reason: string; // Почему рекомендуется
  confidence: number; // 0-1
}

/**
 * Ответ AI на upsell
 */
export interface AiUpsellResponse {
  suggestions: AiUpsellSuggestion[];
}

/**
 * Запрос AI для поиска по меню
 */
export interface AiMenuSearchRequest {
  query: string; // NLP запрос типа "хочу без глютена до 700 ₽"
}

/**
 * Ответ AI для поиска по меню
 */
export interface AiMenuSearchResponse {
  dishes: number[]; // ID найденных блюд
  explanation?: string; // Объяснение результата
}

/**
 * Запрос на генерацию дайджеста
 */
export interface AiDigestRequest {
  date: string; // ISO date
  includeForecasts?: boolean;
}

/**
 * Метрики дайджеста
 */
export interface DigestMetrics {
  revenue: number;
  orderCount: number;
  avgCheck: number;
  growth: {
    revenue: number; // % к предыдущему дню
    orders: number;
  };
}

/**
 * Топовое блюдо
 */
export interface TopDish {
  id: number;
  name: string;
  count: number;
  revenue: number;
}

/**
 * Инсайт от ИИ
 */
export interface AiInsight {
  type: 'success' | 'warning' | 'info';
  message: string;
  priority: 1 | 2 | 3;
}

/**
 * Рекомендация от ИИ
 */
export interface AiRecommendation {
  type: 'menu_optimization' | 'pricing' | 'staffing' | 'inventory';
  title: string;
  description: string;
  actionItems?: string[];
  priority: 1 | 2 | 3;
  confidence?: number;
}

/**
 * Прогноз на день
 */
export interface DayForecast {
  expectedRevenue: number;
  expectedOrders: number;
  confidence: number; // 0-1
}

/**
 * Ответ с дайджестом
 */
export interface AiDigestResponse {
  id: number;
  date: string;
  metrics: DigestMetrics;
  topDishes: TopDish[];
  bottomDishes?: TopDish[];
  insights: string[]; // ИИ-инсайты
  recommendations: AiRecommendation[];
  forecast?: {
    tomorrow: DayForecast;
  };
  createdAt: string;
}

/**
 * Запрос на прогноз
 */
export interface AiForecastRequest {
  dishId?: number; // если не указано - прогноз для всех
  startDate: string;
  endDate: string;
}

/**
 * Прогноз спроса на блюдо
 */
export interface DishForecast {
  dishId: number;
  dishName: string;
  date: string;
  predictedDemand: number;
  confidence: number;
}

/**
 * Глобальные тренды
 */
export interface GlobalTrends {
  weekdayPattern: Record<string, number>;
  seasonalFactor: number;
}

/**
 * Ответ с прогнозом
 */
export interface AiForecastResponse {
  forecasts: DishForecast[];
  globalTrends: GlobalTrends;
}

/**
 * Детальная рекомендация
 */
export interface DetailedRecommendation {
  id: number;
  type: 'menu_optimization' | 'pricing' | 'staffing' | 'inventory';
  title: string;
  content: string;
  actionItems: string[];
  confidence: number;
  priority: 1 | 2 | 3;
  createdAt: string;
  isRead?: boolean;
}

/**
 * Ответ с рекомендациями
 */
export interface AiRecommendationResponse {
  recommendations: DetailedRecommendation[];
}

/**
 * Запрос к чату
 */
export interface AiChatRequest {
  message: string;
  context?: 'menu' | 'orders' | 'analytics' | 'general';
}

/**
 * Ответ от чата
 */
export interface AiChatResponse {
  response: string;
  suggestions?: string[];
  data?: any; // дополнительные данные (графики, таблицы)
}

/**
 * История ИИ-запроса
 */
export interface AiRequestHistory {
  id: number;
  userId: number;
  requestType: 'digest' | 'forecast' | 'recommendation' | 'chat';
  prompt: string;
  response: string;
  modelUsed: string;
  tokensUsed?: number;
  executionTimeMs?: number;
  createdAt: string;
}
