using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Restaurant.Infrastructure.Persistence;

namespace Restaurant.Api.Controllers
{
    [ApiController]
    [Route("api/analytics")]
    public class AnalyticsController : ControllerBase
    {
        private readonly ILogger<AnalyticsController> _logger;
        private readonly AppDbContext _db;

        public AnalyticsController(ILogger<AnalyticsController> logger, AppDbContext db)
        {
            _logger = logger;
            _db = db;
        }

        /// <summary>
        /// Получить KPI панели управления
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardKpi()
        {
            _logger.LogInformation("📊 GetDashboardKpi: Запрос KPI панели управления");
            
            try
            {
                var today = DateTime.UtcNow.Date;
                var tomorrow = today.AddDays(1);
                var last30Days = DateTime.SpecifyKind(today.AddDays(-30), DateTimeKind.Utc);

                // Выручка и заказы за сегодня (только закрытые: closed, Completed, закрыт)
                var todayOrders = await _db.Orders
                    .Where(o => o.CreatedAt >= today && o.CreatedAt < tomorrow 
                        && (o.Status == "closed" || o.Status == "Completed" || o.Status == "закрыт"))
                    .ToListAsync();

                var todayRevenue = todayOrders.Sum(o => o.TotalPrice);
                var todayOrdersCount = todayOrders.Count;

                // Всего за последние 30 дней (для консистентности с AI Insights)
                var monthOrders = await _db.Orders
                    .Where(o => o.CreatedAt >= last30Days 
                        && (o.Status == "closed" || o.Status == "Completed" || o.Status == "закрыт"))
                    .ToListAsync();

                var totalRevenue = monthOrders.Sum(o => o.TotalPrice);
                var totalOrders = monthOrders.Count;
                var averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

                // Занятость столиков (активные заказы / всего столиков)
                var activeOrders = await _db.Orders
                    .Where(o => o.Status == "open" || o.Status == "pending")
                    .CountAsync();
                
                var totalTables = await _db.Tables.CountAsync();
                var tableOccupancy = totalTables > 0 ? (decimal)activeOrders / totalTables * 100 : 0;

                // Популярные блюда за последние 30 дней
                var popularDishes = await _db.OrderItems
                    .Include(oi => oi.Dish)
                    .Where(oi => oi.Order != null && oi.Order.CreatedAt >= last30Days 
                        && (oi.Order.Status == "closed" || oi.Order.Status == "Completed" || oi.Order.Status == "закрыт"))
                    .GroupBy(oi => new { oi.DishId, oi.Dish!.Name })
                    .Select(g => new { 
                        name = g.Key.Name, 
                        orders = g.Sum(oi => oi.Quantity) 
                    })
                    .OrderByDescending(x => x.orders)
                    .Take(3)
                    .ToListAsync();

                var kpi = new
                {
                    totalRevenue = totalRevenue,
                    totalOrders = totalOrders,
                    todayRevenue = todayRevenue,
                    todayOrders = todayOrdersCount,
                    averageOrderValue = Math.Round(averageOrderValue, 2),
                    tableOccupancy = Math.Round(tableOccupancy, 1),
                    popularDishes = popularDishes
                };

                _logger.LogInformation("✅ GetDashboardKpi: Успешно возвращены данные KPI. TotalRevenue={Revenue}, TotalOrders={Orders}", 
                    kpi.totalRevenue, kpi.totalOrders);
                    
                return Ok(kpi);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ GetDashboardKpi: Ошибка при получении KPI");
                return StatusCode(500, new { message = "Ошибка при получении данных" });
            }
        }

        /// <summary>
        /// Получить отчет о выручке (для фронтенда /analytics/reports/revenue)
        /// </summary>
        [HttpGet("revenue")]
        [HttpGet("reports/revenue")]
        public async Task<IActionResult> GetRevenueReport([FromQuery] string? from, [FromQuery] string? to)
        {
            _logger.LogInformation("💰 GetRevenueReport: Запрос отчета о выручке. From={From}, To={To}", from ?? "не указано", to ?? "не указано");
            
            try
            {
                // Парсим даты или используем дефолтные (последние 7 дней)
                var endDate = string.IsNullOrEmpty(to) 
                    ? DateTime.SpecifyKind(DateTime.UtcNow.Date.AddDays(1), DateTimeKind.Utc)
                    : DateTime.SpecifyKind(DateTime.Parse(to).Date.AddDays(1), DateTimeKind.Utc);
                
                var startDate = string.IsNullOrEmpty(from) 
                    ? DateTime.SpecifyKind(endDate.AddDays(-7), DateTimeKind.Utc)
                    : DateTime.SpecifyKind(DateTime.Parse(from).Date, DateTimeKind.Utc);

                _logger.LogInformation("📅 Период: {Start} - {End}", startDate, endDate);

                // Получаем заказы за период (только закрытые: closed, Completed, закрыт)
                var orders = await _db.Orders
                    .Where(o => o.CreatedAt >= startDate && o.CreatedAt < endDate 
                        && (o.Status == "closed" || o.Status == "Completed" || o.Status == "закрыт"))
                    .GroupBy(o => o.CreatedAt.Date)
                    .Select(g => new {
                        date = g.Key,
                        revenue = g.Sum(o => o.TotalPrice),
                        orders = g.Count()
                    })
                    .OrderBy(x => x.date)
                    .ToListAsync();

                // Формируем точки для графика
                var points = orders.Select(o => new {
                    date = o.date.ToString("yyyy-MM-dd"),
                    revenue = o.revenue,
                    orders = o.orders,
                    avgCheck = o.orders > 0 ? o.revenue / o.orders : 0
                }).ToList();

                var totalRevenue = points.Sum(p => p.revenue);
                var totalOrders = points.Sum(p => p.orders);

                var response = new
                {
                    points = points,
                    total = new
                    {
                        revenue = totalRevenue,
                        orders = totalOrders,
                        avgCheck = totalOrders > 0 ? totalRevenue / totalOrders : 0
                    }
                };

                _logger.LogInformation("✅ GetRevenueReport: Успешно. TotalRevenue={Revenue}, TotalOrders={Orders}, Points={PointsCount}", 
                    totalRevenue, totalOrders, points.Count);
                    
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ GetRevenueReport: Ошибка при получении отчета о выручке");
                return StatusCode(500, new { message = "Ошибка при получении данных" });
            }
        }

        /// <summary>
        /// Получить отчет о популярных блюдах (для фронтенда /analytics/reports/popular)
        /// </summary>
        [HttpGet("popular-dishes")]
        [HttpGet("reports/popular")]
        public IActionResult GetPopularDishesReport([FromQuery] string? from, [FromQuery] string? to)
        {
            _logger.LogInformation("🍽️ GetPopularDishesReport: Запрос отчета о популярных блюдах. From={From}, To={To}", 
                from ?? "не указано", to ?? "не указано");
                
            try
            {
                var rows = new[]
                {
                    new { dishId = 1, name = "Стейк Рибай", category = "Meat", qty = 145, share = 12.5m, revenue = 289000.0m },
                    new { dishId = 2, name = "Паста Карбонара", category = "Pasta", qty = 138, share = 11.9m, revenue = 165600.0m },
                    new { dishId = 3, name = "Салат Цезарь", category = "Salad", qty = 132, share = 11.4m, revenue = 105600.0m },
                    new { dishId = 4, name = "Суп Том Ям", category = "Soup", qty = 125, share = 10.8m, revenue = 112500.0m },
                    new { dishId = 5, name = "Пицца Маргарита", category = "Pizza", qty = 118, share = 10.2m, revenue = 94400.0m },
                    new { dishId = 6, name = "Бургер Классик", category = "Burger", qty = 110, share = 9.5m, revenue = 93500.0m },
                    new { dishId = 7, name = "Лосось Гриль", category = "Fish", qty = 95, share = 8.2m, revenue = 190000.0m },
                    new { dishId = 8, name = "Тирамису", category = "Dessert", qty = 87, share = 7.5m, revenue = 52200.0m }
                };

                var response = new
                {
                    rows = rows
                };

                _logger.LogInformation("✅ GetPopularDishesReport: Успешно. Dishes={Count}", rows.Length);
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ GetPopularDishesReport: Ошибка при получении отчета о популярных блюдах");
                return StatusCode(500, new { message = "Ошибка при получении данных" });
            }
        }

        /// <summary>
        /// Получить отчет об официантах (для фронтенда /analytics/reports/waiters)
        /// </summary>
        [HttpGet("waiters")]
        [HttpGet("reports/waiters")]
        public IActionResult GetWaitersReport([FromQuery] string? from, [FromQuery] string? to)
        {
            _logger.LogInformation("👨‍💼 GetWaitersReport: Запрос отчета об официантах. From={From}, To={To}", 
                from ?? "не указано", to ?? "не указано");
                
            try
            {
                var rows = new[]
                {
                    new { waiterId = 1, name = "Иван Петров", closedOrders = 45, revenue = 225000.0m, avgCheck = 5000.0m },
                    new { waiterId = 2, name = "Мария Смирнова", closedOrders = 42, revenue = 210000.0m, avgCheck = 5000.0m },
                    new { waiterId = 3, name = "Алексей Козлов", closedOrders = 38, revenue = 190000.0m, avgCheck = 5000.0m },
                    new { waiterId = 4, name = "Елена Волкова", closedOrders = 35, revenue = 175000.0m, avgCheck = 5000.0m },
                    new { waiterId = 5, name = "Дмитрий Соколов", closedOrders = 32, revenue = 160000.0m, avgCheck = 5000.0m }
                };

                var response = new
                {
                    rows = rows
                };

                _logger.LogInformation("✅ GetWaitersReport: Успешно. Waiters={Count}", rows.Length);
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ GetWaitersReport: Ошибка при получении отчета об официантах");
                return StatusCode(500, new { message = "Ошибка при получении данных" });
            }
        }
    }
}
