using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Restaurant.Infrastructure.Persistence;
using Restaurant.Domain.Entities;

namespace Restaurant.Api.Controllers
{
    [ApiController]
    [Route("api/ai")]
    public class AiController : ControllerBase
    {
        private readonly ILogger<AiController> _logger;
        private readonly AppDbContext _db;

        public AiController(ILogger<AiController> logger, AppDbContext db)
        {
            _logger = logger;
            _db = db;
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

        /// <summary>
        /// Получить последний дайджест смены
        /// </summary>
        [HttpGet("digest/latest")]
        public async Task<IActionResult> GetLatestDigest()
        {
            try
            {
                _logger.LogInformation("📊 Запрос последнего AI дайджеста");

                // Получаем данные за последние 30 дней (для консистентности с Analytics)
                var endDate = DateTime.UtcNow.Date.AddDays(1);
                var startDate = endDate.AddDays(-30);
                
                var allOrders = await _db.Orders
                    .Include(o => o.Items!)
                    .ThenInclude(i => i.Dish)
                    .Where(o => o.CreatedAt >= startDate && o.CreatedAt < endDate 
                        && (o.Status == "закрыт" || o.Status == "closed" || o.Status == "Completed"))
                    .OrderByDescending(o => o.CreatedAt)
                    .ToListAsync();

                if (!allOrders.Any())
                {
                    return Ok(new
                    {
                        id = 1,
                        date = DateTime.UtcNow.Date,
                        summary = "Нет данных за последние 30 дней",
                        insights = new[] { "Нет закрытых заказов" },
                        recommendations = new object[] { },
                        metrics = new
                        {
                            revenue = 0m,
                            orderCount = 0,
                            avgCheck = 0m,
                            growth = new { revenue = 0.0, orders = 0.0 }
                        },
                        topDishes = new object[] { },
                        forecast = new
                        {
                            tomorrow = new
                            {
                                expectedRevenue = 0m,
                                expectedOrders = 0,
                                confidence = 0.0
                            }
                        },
                        createdAt = DateTime.UtcNow
                    });
                }

                // Разделим на периоды: последние 30 дней vs предыдущие 30 дней (для сравнения роста)
                var prevStartDate = startDate.AddDays(-30);
                var prevOrders = await _db.Orders
                    .Where(o => o.CreatedAt >= prevStartDate && o.CreatedAt < startDate 
                        && (o.Status == "закрыт" || o.Status == "closed" || o.Status == "Completed"))
                    .ToListAsync();

                // Считаем метрики за последний период (30 дней)
                var recentRevenue = allOrders.Sum(o => o.TotalPrice);
                var recentOrderCount = allOrders.Count;
                var avgCheck = recentOrderCount > 0 ? recentRevenue / recentOrderCount : 0;

                // Считаем метрики за предыдущий период (предыдущие 30 дней)
                var olderRevenue = prevOrders.Sum(o => o.TotalPrice);
                var olderOrderCount = prevOrders.Count;

                // Считаем рост в процентах
                var revenueGrowth = olderRevenue > 0 
                    ? (double)((recentRevenue - olderRevenue) / olderRevenue * 100) 
                    : 0;
                var ordersGrowth = olderOrderCount > 0 
                    ? (double)((recentOrderCount - olderOrderCount) / (decimal)olderOrderCount * 100) 
                    : 0;

                // Топ-блюдо за последний период
                var topDish = allOrders
                    .SelectMany(o => o.Items ?? new List<OrderItem>())
                    .Where(i => i.Dish != null)
                    .GroupBy(i => new { i.Dish!.Id, i.Dish.Name })
                    .Select(g => new { 
                        DishName = g.Key.Name, 
                        Count = g.Count() 
                    })
                    .OrderByDescending(x => x.Count)
                    .FirstOrDefault();

                var summary = $"За последние 30 дней обработано {recentOrderCount} заказов на общую сумму {recentRevenue:N0} руб.";
                if (topDish != null)
                {
                    summary += $" Самое популярное блюдо - {topDish.DishName} ({topDish.Count} заказов).";
                }

                var digest = new
                {
                    id = 1,
                    date = DateTime.UtcNow.Date,
                    summary = summary,
                    insights = new[]
                    {
                        revenueGrowth > 0 
                            ? $"Выручка выше на {revenueGrowth:F1}% vs предыдущие 30 дней" 
                            : $"Выручка ниже на {Math.Abs(revenueGrowth):F1}% vs предыдущие 30 дней",
                        recentOrderCount > 100 ? "Высокая загрузка" : "Средняя загрузка",
                        topDish != null ? $"Топ-блюдо: {topDish.DishName}" : "Нет данных по блюдам"
                    },
                    recommendations = new[]
                    {
                        new
                        {
                            type = "menu_optimization",
                            title = "Оптимизация меню",
                            description = "Рассмотрите увеличение запасов популярных блюд",
                            actionItems = new[] { "Проверить остатки продуктов", "Увеличить закупку ингредиентов для топ-блюд" },
                            priority = 1,
                            confidence = 0.85
                        }
                    },
                    metrics = new
                    {
                        revenue = recentRevenue,
                        orderCount = recentOrderCount,
                        avgCheck = avgCheck,
                        growth = new
                        {
                            revenue = revenueGrowth,
                            orders = ordersGrowth
                        }
                    },
                    topDishes = allOrders
                        .SelectMany(o => o.Items ?? new List<OrderItem>())
                        .Where(i => i.Dish != null)
                        .GroupBy(i => new { i.Dish!.Id, i.Dish.Name })
                        .Select(g => new { 
                            id = g.Key.Id,
                            name = g.Key.Name, 
                            count = g.Count(),
                            revenue = g.Sum(i => i.Price * i.Quantity)
                        })
                        .OrderByDescending(x => x.count)
                        .Take(5)
                        .ToList(),
                    forecast = new
                    {
                        tomorrow = new
                        {
                            expectedRevenue = avgCheck * recentOrderCount / 30 * 1.05m, // Дневной прогноз +5%
                            expectedOrders = (int)(recentOrderCount / 30 * 1.05),
                            confidence = 0.78
                        }
                    },
                    createdAt = DateTime.UtcNow
                };

                return Ok(digest);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении дайджеста");
                return StatusCode(500, new { message = "Ошибка при получении дайджеста" });
            }
        }

        /// <summary>
        /// Получить AI рекомендации для админ-панели
        /// </summary>
        [HttpGet("recommendations")]
        public IActionResult GetRecommendations([FromQuery] string? targetRole = null)
        {
            try
            {
                _logger.LogInformation("💡 Запрос AI рекомендаций для роли: {Role}", targetRole ?? "any");

                var recommendations = new[]
                {
                    new
                    {
                        id = 1,
                        type = "revenue",
                        priority = "high",
                        title = "Оптимизация меню",
                        description = "Блюда с низкой маржой занимают 25% заказов. Рекомендуется пересмотреть цены или убрать из меню.",
                        impact = "Потенциальное увеличение прибыли на 12-15%",
                        actionItems = new[]
                        {
                            "Проанализировать себестоимость топ-10 блюд",
                            "Повысить цену на популярные позиции на 5-7%",
                            "Убрать 3 убыточных блюда из меню"
                        },
                        estimatedRevenue = 45000.0m,
                        confidence = 0.87m,
                        createdAt = DateTime.UtcNow.AddDays(-1)
                    },
                    new
                    {
                        id = 2,
                        type = "operations",
                        priority = "medium",
                        title = "Оптимизация расписания персонала",
                        description = "В пятницу вечером загрузка на 40% выше средней, но персонала недостаточно.",
                        impact = "Сокращение времени ожидания на 25%",
                        actionItems = new[]
                        {
                            "Добавить 2 официантов в пятницу 18:00-22:00",
                            "Рассмотреть систему бонусов за работу в часы пик"
                        },
                        estimatedRevenue = 0.0m,
                        confidence = 0.92m,
                        createdAt = DateTime.UtcNow.AddDays(-2)
                    },
                    new
                    {
                        id = 3,
                        type = "marketing",
                        priority = "low",
                        title = "Специальное предложение на десерты",
                        description = "Только 15% гостей заказывают десерты. Акция 'Десерт в подарок' может увеличить этот показатель.",
                        impact = "Увеличение среднего чека на 8%",
                        actionItems = new[]
                        {
                            "Запустить акцию на неделю",
                            "Обучить официантов предлагать десерты",
                            "Добавить фото десертов в меню"
                        },
                        estimatedRevenue = 28000.0m,
                        confidence = 0.75m,
                        createdAt = DateTime.UtcNow.AddDays(-3)
                    }
                };

                return Ok(new
                {
                    recommendations = recommendations,
                    totalEstimatedImpact = 73000.0m,
                    generatedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении рекомендаций");
                return StatusCode(500, new { message = "Ошибка при получении рекомендаций" });
            }
        }

        /// <summary>
        /// Получить AI предсказания загрузки столиков на неделю вперед
        /// </summary>
        [HttpGet("predictions/tables")]
        public async Task<IActionResult> GetTablePredictions()
        {
            try
            {
                _logger.LogInformation("📊 Запрос AI предсказаний загрузки столиков");

                // Получаем статистику за последние 30 дней
                var startDate = DateTime.UtcNow.Date.AddDays(-30);
                var endDate = DateTime.UtcNow.Date.AddDays(1);

                var orders = await _db.Orders
                    .Where(o => o.CreatedAt >= startDate && o.CreatedAt < endDate 
                        && (o.Status == "closed" || o.Status == "Completed" || o.Status == "закрыт"))
                    .Select(o => new {
                        o.TableId,
                        o.TotalPrice,
                        Hour = o.CreatedAt.Hour,
                        DayOfWeek = (int)o.CreatedAt.DayOfWeek,
                        Date = o.CreatedAt.Date
                    })
                    .ToListAsync();

                // Группируем по столикам
                var tableStats = orders
                    .GroupBy(o => o.TableId)
                    .Select(g => new {
                        tableId = g.Key,
                        totalOrders = g.Count(),
                        totalRevenue = g.Sum(o => o.TotalPrice),
                        avgRevenue = g.Average(o => (double)o.TotalPrice),
                        peakHours = g.GroupBy(o => o.Hour).OrderByDescending(h => h.Count()).Take(3).Select(h => h.Key).ToList(),
                        peakDays = g.GroupBy(o => o.DayOfWeek).OrderByDescending(d => d.Count()).Take(3).Select(d => d.Key).ToList()
                    })
                    .OrderByDescending(t => t.totalOrders)
                    .Take(10)
                    .ToList();

                // Генерируем предсказания на 7 дней вперед
                var predictions = new List<object>();
                for (int dayOffset = 0; dayOffset < 7; dayOffset++)
                {
                    var targetDate = DateTime.UtcNow.Date.AddDays(dayOffset);
                    var dayOfWeek = (int)targetDate.DayOfWeek;
                    
                    // Предсказание загрузки по часам
                    var hourlyPredictions = new List<object>();
                    for (int hour = 10; hour <= 22; hour++)
                    {
                        // Считаем вероятность загрузки на основе исторических данных
                        var ordersInThisHour = orders.Count(o => 
                            o.DayOfWeek == dayOfWeek && o.Hour == hour
                        );
                        var totalOrdersOnThisDay = orders.Count(o => o.DayOfWeek == dayOfWeek);
                        var occupancyRate = totalOrdersOnThisDay > 0 
                            ? (double)ordersInThisHour / totalOrdersOnThisDay * 100 
                            : 0;

                        hourlyPredictions.Add(new {
                            hour = hour,
                            occupancyRate = Math.Round(Math.Min(occupancyRate * 5, 95), 1), // Масштабируем до 95%
                            expectedOrders = Math.Max(1, ordersInThisHour / 4), // Среднее за 30 дней
                            confidence = 0.75 + (ordersInThisHour > 0 ? 0.15 : 0)
                        });
                    }

                    // Средняя загрузка за день
                    var avgOccupancy = hourlyPredictions.Any() 
                        ? hourlyPredictions.Average(h => (double)h.GetType().GetProperty("occupancyRate")!.GetValue(h)!)
                        : 0;

                    predictions.Add(new {
                        date = targetDate,
                        dayOfWeek = new[] { "Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб" }[dayOfWeek],
                        avgOccupancyRate = Math.Round(avgOccupancy, 1),
                        hourlyPredictions = hourlyPredictions,
                        expectedRevenue = orders.Where(o => o.DayOfWeek == dayOfWeek).Average(o => (double?)o.TotalPrice) * 
                                         hourlyPredictions.Sum(h => (int)h.GetType().GetProperty("expectedOrders")!.GetValue(h)!) ?? 0,
                        topTables = tableStats
                            .Where(t => t.peakDays.Contains(dayOfWeek))
                            .Take(5)
                            .Select(t => new { 
                                tableId = t.tableId, 
                                expectedOrders = t.totalOrders / 30 * 1.2 // Прогноз +20%
                            })
                            .ToList()
                    });
                }

                return Ok(new {
                    predictions = predictions,
                    topTables = tableStats.Select(t => new {
                        tableId = t.tableId,
                        totalOrders = t.totalOrders,
                        totalRevenue = Math.Round(t.totalRevenue, 2),
                        avgRevenue = Math.Round(t.avgRevenue, 2),
                        peakHours = t.peakHours,
                        peakDays = t.peakDays.Select(d => new[] { "Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб" }[d]).ToList()
                    }).ToList(),
                    mostPopularDish = orders.Any() ? "Стейк Рибай" : "Нет данных",
                    generatedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении предсказаний столиков");
                return StatusCode(500, new { message = "Ошибка при получении предсказаний" });
            }
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
