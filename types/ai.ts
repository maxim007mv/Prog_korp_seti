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
