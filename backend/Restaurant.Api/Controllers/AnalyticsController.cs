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
        [HttpGet("revenue")]
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
        [HttpGet("popular-dishes")]
        public IActionResult GetPopularDishesReport([FromQuery] string? from, [FromQuery] string? to)
        {
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

                return Ok(response);
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
        [HttpGet("waiters")]
        public IActionResult GetWaitersReport([FromQuery] string? from, [FromQuery] string? to)
        {
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

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении отчета об официантах");
                return StatusCode(500, new { message = "Ошибка при получении данных" });
            }
        }
    }
}
