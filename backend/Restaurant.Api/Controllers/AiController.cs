using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Restaurant.Api.Controllers
{
    [ApiController]
    [Route("api/ai")]
    public class AiController : ControllerBase
    {
        private readonly ILogger<AiController> _logger;

        public AiController(ILogger<AiController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// AI чат - отправить сообщение
        /// </summary>
        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            try
            {
                _logger.LogInformation("AI Chat request: {Message}", request.Message);

                // Mock AI ответы
                var response = GenerateMockAiResponse(request.Message);

                await Task.Delay(500); // Имитация обработки

                return Ok(new
                {
                    message = response,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка в AI чате");
                return StatusCode(500, new { message = "Ошибка при обработке запроса" });
            }
        }

        /// <summary>
        /// Получить AI рекомендации по меню
        /// </summary>
        [HttpPost("upsell")]
        public IActionResult GetUpsellRecommendations([FromBody] UpsellRequest request)
        {
            try
            {
                _logger.LogInformation("AI Upsell request for order items: {Count}", request.OrderItems?.Length ?? 0);

                var recommendations = new[]
                {
                    new
                    {
                        dishId = 15,
                        dishName = "Десерт Тирамису",
                        reason = "Отлично сочетается с основным блюдом",
                        confidence = 0.92m
                    },
                    new
                    {
                        dishId = 23,
                        dishName = "Вино Каберне",
                        reason = "Идеально дополнит стейк",
                        confidence = 0.88m
                    },
                    new
                    {
                        dishId = 8,
                        dishName = "Салат Цезарь",
                        reason = "Популярная закуска к основному блюду",
                        confidence = 0.75m
                    }
                };

                return Ok(new
                {
                    recommendations = recommendations,
                    totalPotentialRevenue = 2450.0m
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении AI рекомендаций");
                return StatusCode(500, new { message = "Ошибка при получении рекомендаций" });
            }
        }

        /// <summary>
        /// AI поиск по меню
        /// </summary>
        [HttpGet("search")]
        public IActionResult SearchMenu([FromQuery] string query)
        {
            try
            {
                _logger.LogInformation("AI Search query: {Query}", query);

                var results = new[]
                {
                    new
                    {
                        dishId = 5,
                        dishName = "Стейк Рибай",
                        relevanceScore = 0.95m,
                        reason = "Соответствует вашему запросу"
                    },
                    new
                    {
                        dishId = 12,
                        dishName = "Паста Карбонара",
                        relevanceScore = 0.82m,
                        reason = "Похожее блюдо"
                    }
                };

                return Ok(new
                {
                    query = query,
                    results = results,
                    suggestions = new[] { "стейк медиум", "стейк веллдан", "говядина" }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при AI поиске");
                return StatusCode(500, new { message = "Ошибка при поиске" });
            }
        }

        private string GenerateMockAiResponse(string message)
        {
            var lowerMessage = message.ToLower();

            if (lowerMessage.Contains("выручка") || lowerMessage.Contains("доход"))
            {
                return "📊 Анализирую данные о выручке...\n\n" +
                       "За последние 7 дней выручка составила 1,250,000 ₽. Это на 12% выше прошлой недели. " +
                       "Самый прибыльный день - пятница (255,000 ₽). Рекомендую увеличить запасы популярных блюд на выходные.";
            }

            if (lowerMessage.Contains("популярн") || lowerMessage.Contains("блюд"))
            {
                return "🍽️ Топ-3 самых популярных блюда:\n\n" +
                       "1. Стейк Рибай - 145 заказов\n" +
                       "2. Паста Карбонара - 138 заказов\n" +
                       "3. Салат Цезарь - 132 заказа\n\n" +
                       "Стейк приносит наибольшую прибыль. Советую добавить акцию на комбо со стейком.";
            }

            if (lowerMessage.Contains("сотрудник") || lowerMessage.Contains("официант"))
            {
                return "👥 Анализ производительности персонала:\n\n" +
                       "Иван Петров - лучший официант месяца (45 заказов, рейтинг 4.8).\n" +
                       "Средний чек по команде - 3,654 ₽.\n" +
                       "Рекомендую провести тренинг по допродажам для повышения среднего чека.";
            }

            if (lowerMessage.Contains("рекоменд") || lowerMessage.Contains("совет"))
            {
                return "💡 AI рекомендации для роста бизнеса:\n\n" +
                       "• Добавьте сезонное меню (осенние блюда)\n" +
                       "• Запустите программу лояльности\n" +
                       "• Увеличьте присутствие в соцсетях\n" +
                       "• Проведите дегустацию новых блюд";
            }

            if (lowerMessage.Contains("привет") || lowerMessage.Contains("hello"))
            {
                return "👋 Привет! Я AI-ассистент ресторана. Могу помочь с:\n\n" +
                       "• Анализом выручки и заказов\n" +
                       "• Рекомендациями по меню\n" +
                       "• Оптимизацией работы персонала\n" +
                       "• Прогнозами спроса\n\n" +
                       "Задайте мне любой вопрос о работе ресторана!";
            }

            return "🤖 Понял ваш запрос. Для более детального анализа мне нужно больше информации. " +
                   "Попробуйте спросить о выручке, популярных блюдах, персонале или запросите рекомендации.";
        }
    }

    public class ChatRequest
    {
        public string Message { get; set; } = string.Empty;
    }

    public class UpsellRequest
    {
        public int[]? OrderItems { get; set; }
    }
}
