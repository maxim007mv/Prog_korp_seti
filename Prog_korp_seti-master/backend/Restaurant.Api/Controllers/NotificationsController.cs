using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Restaurant.Api.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    public class NotificationsController : ControllerBase
    {
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(ILogger<NotificationsController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Получить непрочитанные уведомления
        /// </summary>
        [HttpGet("unread")]
        public IActionResult GetUnreadNotifications()
        {
            try
            {
                var notifications = new[]
                {
                    new 
                    { 
                        id = 1,
                        title = "Новое бронирование",
                        message = "Стол #5 забронирован на 19:00",
                        type = "booking",
                        createdAt = DateTime.UtcNow.AddMinutes(-15),
                        isRead = false
                    },
                    new 
                    { 
                        id = 2,
                        title = "Новый заказ",
                        message = "Заказ #342 принят на обработку",
                        type = "order",
                        createdAt = DateTime.UtcNow.AddMinutes(-30),
                        isRead = false
                    },
                    new 
                    { 
                        id = 3,
                        title = "Заканчивается продукт",
                        message = "Мало лосося на складе (осталось 2 кг)",
                        type = "warning",
                        createdAt = DateTime.UtcNow.AddHours(-1),
                        isRead = false
                    }
                };

                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении уведомлений");
                return StatusCode(500, new { message = "Ошибка при получении уведомлений" });
            }
        }

        /// <summary>
        /// Получить последние уведомления (для колокольчика)
        /// </summary>
        [HttpGet("latest")]
        public IActionResult GetLatestNotifications([FromQuery] int limit = 5)
        {
            try
            {
                var notifications = new[]
                {
                    new 
                    { 
                        id = 1,
                        title = "Новое бронирование",
                        message = "Стол #5 забронирован на 19:00",
                        type = "booking",
                        createdAt = DateTime.UtcNow.AddMinutes(-15),
                        isRead = false
                    },
                    new 
                    { 
                        id = 2,
                        title = "Новый заказ",
                        message = "Заказ #342 принят на обработку",
                        type = "order",
                        createdAt = DateTime.UtcNow.AddMinutes(-30),
                        isRead = false
                    },
                    new 
                    { 
                        id = 3,
                        title = "Заканчивается продукт",
                        message = "Мало лосося на складе (осталось 2 кг)",
                        type = "warning",
                        createdAt = DateTime.UtcNow.AddHours(-1),
                        isRead = false
                    },
                    new 
                    { 
                        id = 4,
                        title = "Заказ готов",
                        message = "Заказ #340 готов к подаче",
                        type = "info",
                        createdAt = DateTime.UtcNow.AddHours(-2),
                        isRead = true
                    },
                    new 
                    { 
                        id = 5,
                        title = "Отмена бронирования",
                        message = "Бронирование #125 было отменено",
                        type = "warning",
                        createdAt = DateTime.UtcNow.AddHours(-3),
                        isRead = true
                    }
                };

                var result = notifications.Take(limit);
                return Ok(new { 
                    notifications = result,
                    unreadCount = notifications.Count(n => !n.isRead)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении последних уведомлений");
                return StatusCode(500, new { message = "Ошибка при получении уведомлений" });
            }
        }

        /// <summary>
        /// Получить все уведомления
        /// </summary>
        [HttpGet]
        public IActionResult GetAllNotifications()
        {
            try
            {
                var notifications = new[]
                {
                    new 
                    { 
                        id = 1,
                        title = "Новое бронирование",
                        message = "Стол #5 забронирован на 19:00",
                        type = "booking",
                        createdAt = DateTime.UtcNow.AddMinutes(-15),
                        isRead = false
                    },
                    new 
                    { 
                        id = 2,
                        title = "Новый заказ",
                        message = "Заказ #342 принят на обработку",
                        type = "order",
                        createdAt = DateTime.UtcNow.AddMinutes(-30),
                        isRead = false
                    },
                    new 
                    { 
                        id = 3,
                        title = "Заказ готов",
                        message = "Заказ #340 готов к подаче",
                        type = "info",
                        createdAt = DateTime.UtcNow.AddHours(-2),
                        isRead = true
                    }
                };

                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении уведомлений");
                return StatusCode(500, new { message = "Ошибка при получении уведомлений" });
            }
        }

        /// <summary>
        /// Отметить уведомление как прочитанное
        /// </summary>
        [HttpPatch("{id}/read")]
        public IActionResult MarkAsRead(int id)
        {
            try
            {
                _logger.LogInformation("Уведомление {Id} отмечено как прочитанное", id);
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении уведомления");
                return StatusCode(500, new { message = "Ошибка при обновлении уведомления" });
            }
        }
    }
}
