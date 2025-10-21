import type { Dish } from '@/types/dish';
import type { Order } from '@/types/order';
import type { AiMenuSearchResponse, AiUpsellResponse } from '@/types/ai';

/**
 * DeepSeek API конфигурация
 */
const DEEPSEEK_API_KEY = 'sk-f6e4ca3f948f4a96ba0926760f12c9d8';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * Базовый запрос к DeepSeek API
 */
async function callDeepSeek(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('DeepSeek API call failed:', error);
    throw error;
  }
}

/**
 * NLP-поиск по меню
 * Пример запросов: "без глютена до 700₽", "острое мясо", "десерт с шоколадом"
 */
export async function searchMenuWithAI(
  query: string,
  allDishes: Dish[]
): Promise<AiMenuSearchResponse> {
  const systemPrompt = `Ты — ассистент ресторана. Твоя задача — анализировать запросы клиентов на естественном языке и находить подходящие блюда из меню.

Меню ресторана (JSON):
${JSON.stringify(
  allDishes.map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category,
    price: d.price,
    weight: d.weight,
    composition: d.composition,
    tags: d.tags,
  })),
  null,
  2
)}

Верни ответ строго в JSON формате:
{
  "dishes": [1, 5, 12],  // массив ID подходящих блюд
  "explanation": "Нашёл 3 блюда: Салат Цезарь (без глютена), Стейк рибай (мясо), Тирамису (десерт)"
}`;

  const userPrompt = `Запрос клиента: "${query}"

Найди все блюда, которые соответствуют этому запросу. Учитывай:
- Категорию блюда
- Состав (composition)
- Теги (tags)
- Цену
- Ограничения (вегетарианское, без глютена, острое и т.д.)

Верни JSON с массивом ID и объяснением.`;

  const aiResponse = await callDeepSeek(systemPrompt, userPrompt);

  try {
    // Извлекаем JSON из ответа (AI может добавить текст вокруг)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      dishes: parsed.dishes || [],
      explanation: parsed.explanation || 'Результаты поиска',
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    // Fallback: простой поиск по имени
    const fallbackDishes = allDishes
      .filter((d) =>
        d.name.toLowerCase().includes(query.toLowerCase())
      )
      .map((d) => d.id)
      .slice(0, 5);

    return {
      dishes: fallbackDishes,
      explanation: `Найдено по имени: ${fallbackDishes.length} блюд`,
    };
  }
}

/**
 * AI рекомендации для upsell
 * Анализирует текущий заказ и предлагает дополнительные блюда
 */
export async function getUpsellSuggestions(
  order: Order,
  allDishes: Dish[]
): Promise<AiUpsellResponse> {
  // Получаем блюда из текущего заказа
  const orderDishIds = order.items?.map((item) => item.dishId) || [];
  const orderDishes = allDishes.filter((d) => orderDishIds.includes(d.id));

  const systemPrompt = `Ты — AI-ассистент ресторана, специализирующийся на upsell (допродажах). Твоя задача — анализировать текущий заказ клиента и предлагать дополнительные блюда, которые хорошо дополнят заказ.

Полное меню ресторана:
${JSON.stringify(
  allDishes.map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category,
    price: d.price,
    composition: d.composition,
  })),
  null,
  2
)}

Правила рекомендаций:
1. К основным блюдам предлагай гарниры, соусы, напитки
2. К салатам предлагай хлеб или супы
3. К горячему предлагай десерты
4. Учитывай баланс вкусов (к острому — освежающее)
5. Не предлагай блюда, которые уже есть в заказе
6. Максимум 3 предложения

Верни JSON:
{
  "suggestions": [
    {
      "dishId": 5,
      "reason": "Салат Цезарь отлично дополнит стейк",
      "confidence": 0.9
    }
  ]
}`;

  const userPrompt = `Текущий заказ клиента:
${JSON.stringify(
  orderDishes.map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category,
  })),
  null,
  2
)}

Предложи 2-3 дополнительных блюда для этого заказа. Верни JSON с массивом suggestions.`;

  const aiResponse = await callDeepSeek(systemPrompt, userPrompt);

  try {
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Добавляем полную информацию о блюдах
    const suggestions = (parsed.suggestions || []).map(
      (s: { dishId: number; reason: string; confidence: number }) => {
        const dish = allDishes.find((d) => d.id === s.dishId);
        return {
          dishId: s.dishId,
          dish: dish
            ? {
                id: dish.id,
                name: dish.name,
                price: dish.price,
                imageUrl: dish.imageUrl,
              }
            : undefined,
          reason: s.reason,
          confidence: s.confidence,
        };
      }
    );

    return { suggestions };
  } catch (error) {
    console.error('Failed to parse AI upsell response:', error);

    // Fallback: простые правила
    const fallbackSuggestions = [];

    // Если есть основное блюдо, предложи салат
    const hasMainCourse = orderDishes.some(
      (d) => d.category === 'Mains' || d.category === 'HotSnacks'
    );
    if (hasMainCourse) {
      const salad = allDishes.find(
        (d) => d.category === 'Salads' && !orderDishIds.includes(d.id)
      );
      if (salad) {
        fallbackSuggestions.push({
          dishId: salad.id,
          dish: {
            id: salad.id,
            name: salad.name,
            price: salad.price,
            imageUrl: salad.imageUrl,
          },
          reason: 'Свежий салат отлично дополнит основное блюдо',
          confidence: 0.7,
        });
      }
    }

    // Если нет десерта, предложи
    const hasDessert = orderDishes.some((d) => d.category === 'Desserts');
    if (!hasDessert) {
      const dessert = allDishes.find(
        (d) => d.category === 'Desserts' && !orderDishIds.includes(d.id)
      );
      if (dessert) {
        fallbackSuggestions.push({
          dishId: dessert.id,
          dish: {
            id: dessert.id,
            name: dessert.name,
            price: dessert.price,
            imageUrl: dessert.imageUrl,
          },
          reason: 'Завершите трапезу вкусным десертом',
          confidence: 0.6,
        });
      }
    }

    return { suggestions: fallbackSuggestions };
  }
}

/**
 * AI дайджест дня для админа (опционально)
 */
export async function getDailySummary(
  date: string,
  stats: {
    revenue: number;
    orders: number;
    topDish: string;
    topWaiter: string;
  }
): Promise<string> {
  const systemPrompt = `Ты — аналитик ресторана. Создай краткий, но содержательный дайджест дня на русском языке для владельца ресторана.`;

  const userPrompt = `Статистика за ${date}:
- Выручка: ${stats.revenue}₽
- Заказов: ${stats.orders}
- Топ блюдо: ${stats.topDish}
- Лучший официант: ${stats.topWaiter}

Создай дайджест на 2-3 предложения с ключевыми инсайтами и рекомендациями.`;

  return callDeepSeek(systemPrompt, userPrompt);
}
