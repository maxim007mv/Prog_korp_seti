using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Restaurant.Api.Controllers
{
    [ApiController]
    [Route("api/analytics")]
    public class AnalyticsController : ControllerBase
    {
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(ILogger<AnalyticsController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Получить KPI панели управления
        /// </summary>
        [HttpGet("dashboard")]
        public IActionResult GetDashboardKpi()
        {
            try
            {
                var kpi = new
                {
                    totalRevenue = 1250000.50m,
                    totalOrders = 342,
                    averageOrderValue = 3654.97m,
                    tableOccupancy = 78.5m,
                    popularDishes = new[]
                    {
                        new { name = "Стейк Рибай", orders = 45 },
                        new { name = "Паста Карбонара", orders = 38 },
                        new { name = "Салат Цезарь", orders = 32 }
                    }
                };

                return Ok(kpi);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении KPI");
                return StatusCode(500, new { message = "Ошибка при получении данных" });
            }
        }

        /// <summary>
        /// Получить отчет о выручке
        /// </summary>
        [HttpGet("reports/revenue")]
        public IActionResult GetRevenueReport([FromQuery] string? from, [FromQuery] string? to)
        {
            try
            {
                var points = new[]
                {
                    new { date = "2025-10-17", revenue = 45000.0m, orders = 23, avgCheck = 45000.0m / 23 },
                    new { date = "2025-10-18", revenue = 52000.0m, orders = 28, avgCheck = 52000.0m / 28 },
                    new { date = "2025-10-19", revenue = 48000.0m, orders = 25, avgCheck = 48000.0m / 25 },
                    new { date = "2025-10-20", revenue = 55000.0m, orders = 30, avgCheck = 55000.0m / 30 },
                    new { date = "2025-10-21", revenue = 62000.0m, orders = 35, avgCheck = 62000.0m / 35 },
                    new { date = "2025-10-22", revenue = 58000.0m, orders = 32, avgCheck = 58000.0m / 32 },
                    new { date = "2025-10-23", revenue = 51000.0m, orders = 27, avgCheck = 51000.0m / 27 }
                };

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

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении отчета о выручке");
                return StatusCode(500, new { message = "Ошибка при получении данных" });
            }
        }

        /// <summary>
        /// Получить отчет о популярных блюдах
        /// </summary>
        [HttpGet("reports/popular")]
        public IActionResult GetPopularDishesReport([FromQuery] string? from, [FromQuery] string? to)
        {
            try
            {
                var data = new[]
                {
                    new { dishName = "Стейк Рибай", orders = 145, revenue = 289000.0m },
                    new { dishName = "Паста Карбонара", orders = 138, revenue = 165600.0m },
                    new { dishName = "Салат Цезарь", orders = 132, revenue = 105600.0m },
                    new { dishName = "Суп Том Ям", orders = 125, revenue = 112500.0m },
                    new { dishName = "Пицца Маргарита", orders = 118, revenue = 94400.0m },
                    new { dishName = "Бургер Классик", orders = 110, revenue = 93500.0m },
                    new { dishName = "Лосось Гриль", orders = 95, revenue = 190000.0m },
                    new { dishName = "Тирамису", orders = 87, revenue = 52200.0m }
                };

                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении отчета о популярных блюдах");
                return StatusCode(500, new { message = "Ошибка при получении данных" });
            }
        }

        /// <summary>
        /// Получить отчет об официантах
        /// </summary>
        [HttpGet("reports/waiters")]
        public IActionResult GetWaitersReport([FromQuery] string? from, [FromQuery] string? to)
        {
            try
            {
                var data = new[]
                {
                    new { name = "Иван Петров", orders = 45, revenue = 225000.0m, averageRating = 4.8m },
                    new { name = "Мария Смирнова", orders = 42, revenue = 210000.0m, averageRating = 4.7m },
                    new { name = "Алексей Козлов", orders = 38, revenue = 190000.0m, averageRating = 4.6m },
                    new { name = "Елена Волкова", orders = 35, revenue = 175000.0m, averageRating = 4.5m },
                    new { name = "Дмитрий Соколов", orders = 32, revenue = 160000.0m, averageRating = 4.4m }
                };

                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении отчета об официантах");
                return StatusCode(500, new { message = "Ошибка при получении данных" });
            }
        }
    }
}
