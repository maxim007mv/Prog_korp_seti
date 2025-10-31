using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Restaurant.Infrastructure.Persistence;
using Restaurant.Domain.Entities;
using Serilog.Context;
using System.Text.Json;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(AppDbContext context, ILogger<OrdersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] string? status, [FromQuery] int? tableId)
    {
        var query = _context.Orders.AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(o => o.Status == status);
        }

        if (tableId.HasValue)
        {
            query = query.Where(o => o.TableId == tableId);
        }

        var orders = await query
            .Include(o => o.Items!)
                .ThenInclude(i => i.Dish)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var result = orders.Select(o => new
        {
            o.Id,
            o.TableId,
            o.WaiterId,
            o.Status,
            TotalAmount = o.TotalPrice,
            o.CreatedAt,
            o.UpdatedAt,
            Items = (o.Items ?? new List<OrderItem>()).Select(i => new
            {
                i.Id,
                i.DishId,
                DishName = i.Dish?.Name ?? "Неизвестное блюдо",
                i.Quantity,
                i.Price,
                Subtotal = i.Quantity * i.Price
            }).ToList()
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Items!)
                .ThenInclude(i => i.Dish)
            .Where(o => o.Id == id)
            .FirstOrDefaultAsync();

        if (order == null)
        {
            return NotFound();
        }

        var result = new
        {
            order.Id,
            order.TableId,
            order.WaiterId,
            order.Status,
            TotalAmount = order.TotalPrice,
            order.CreatedAt,
            order.UpdatedAt,
            Items = (order.Items ?? new List<OrderItem>()).Select(i => new
            {
                i.Id,
                i.DishId,
                DishName = i.Dish?.Name ?? "Неизвестное блюдо",
                i.Quantity,
                i.Price,
                Subtotal = i.Quantity * i.Price
            }).ToList()
        };

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        using (LogContext.PushProperty("TableId", dto.TableId))
        using (LogContext.PushProperty("RequestedWaiterId", dto.WaiterId))
        using (LogContext.PushProperty("ItemsCount", dto.Items.Count))
        {
            _logger.LogInformation("Creating new order for table {TableId} with {ItemsCount} items", 
                dto.TableId, dto.Items.Count);

            // Если WaiterId не указан или равен 0, берем первого доступного официанта
            int? waiterId = dto.WaiterId;
            if (waiterId == 0)
            {
                _logger.LogInformation("WaiterId not specified, searching for available waiter");
                // Ищем waiter_id из таблицы waiters (не users!)
                var waiterRecord = await _context.Set<Restaurant.Domain.Entities.Waiter>()
                    .Where(w => w.IsActive)
                    .FirstOrDefaultAsync();
                
                if (waiterRecord != null)
                {
                    waiterId = waiterRecord.Id;
                    _logger.LogInformation("Assigned waiter {WaiterId} to order", waiterId);
                }
                else
                {
                    _logger.LogWarning("No active waiters found, order will have no waiter assigned");
                    waiterId = null;
                }
            }

            var order = new Order
            {
                TableId = dto.TableId,
                WaiterId = waiterId,
                BookingId = dto.BookingId,
                Comment = dto.Comment,
                Status = "pending",
                TotalPrice = 0,
                StartTime = DateTime.UtcNow,
                ShiftDate = DateTime.UtcNow.Date,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Items = new List<OrderItem>()
            };

            decimal total = 0;
            foreach (var item in dto.Items)
            {
                var dish = await _context.Dishes.FindAsync(item.DishId);
                if (dish == null)
                {
                    _logger.LogWarning("Dish {DishId} not found while creating order", item.DishId);
                    return BadRequest($"Dish with id {item.DishId} not found");
                }

                var orderItem = new OrderItem
                {
                    DishId = item.DishId,
                    Quantity = item.Quantity,
                    Price = dish.Price,
                    Comment = item.Comment
                };

                total += orderItem.Price * orderItem.Quantity;
                order.Items.Add(orderItem);
            }

            order.TotalPrice = total;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Order {OrderId} created successfully with total {TotalPrice}", 
                order.Id, order.TotalPrice);

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, new { id = order.Id });
        }
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null)
        {
            return NotFound();
        }

        order.Status = dto.Status;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { id = order.Id, status = order.Status });
    }

    /// <summary>
    /// Удаление заказа с автоматическим удалением клиента, если это его последний заказ
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(int id, [FromQuery] int? adminId = null, [FromQuery] string? comment = null)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // 1. Получаем заказ с данными клиента
            var order = await _context.Orders
                .Include(o => o.Items)
                .Include(o => o.Client)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound(new { error = "Заказ не найден" });
            }

            // 2. Сохраняем snapshot для лога
            var orderSnapshot = JsonSerializer.Serialize(new
            {
                order.Id,
                order.TableId,
                order.ClientId,
                ClientName = order.Client != null ? $"{order.Client.FirstName} {order.Client.LastName}" : null,
                order.TotalPrice,
                order.Status,
                ItemsCount = order.Items?.Count ?? 0
            });

            // 3. Проверяем, остались ли у клиента другие заказы
            int? clientId = order.ClientId;
            bool shouldDeleteClient = false;

            if (clientId.HasValue)
            {
                var clientOrdersCount = await _context.Orders
                    .CountAsync(o => o.ClientId == clientId && o.Id != id);

                shouldDeleteClient = clientOrdersCount == 0;

                _logger.LogInformation(
                    "Заказ ID: {OrderId}, Клиент ID: {ClientId}, Других заказов: {OrdersCount}, Удалить клиента: {DeleteClient}",
                    id, clientId, clientOrdersCount, shouldDeleteClient);
            }

            // 4. Логируем удаление заказа
            var adminLog = new AdminLog
            {
                AdminId = adminId,
                AdminUsername = User.Identity?.Name ?? "system",
                Action = "DELETE",
                EntityType = "Order",
                EntityId = order.Id,
                EntityData = orderSnapshot,
                Comment = comment ?? (shouldDeleteClient ? "Удален заказ и клиент (последний заказ)" : "Удален заказ"),
                Timestamp = DateTime.UtcNow
            };

            _context.AdminLogs.Add(adminLog);

            // 5. Удаляем заказ (OrderItems удалятся каскадно благодаря ON DELETE CASCADE)
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            string message;
            if (shouldDeleteClient && clientId.HasValue)
            {
                // 6. Удаляем клиента, если это был его последний заказ
                var client = await _context.Clients.FindAsync(clientId.Value);
                if (client != null)
                {
                    var clientLog = new AdminLog
                    {
                        AdminId = adminId,
                        AdminUsername = User.Identity?.Name ?? "system",
                        Action = "DELETE",
                        EntityType = "Client",
                        EntityId = client.Id,
                        EntityData = JsonSerializer.Serialize(new { client.Id, client.Phone, client.FirstName, client.LastName }),
                        Comment = $"Автоматически удален после удаления последнего заказа ID: {order.Id}",
                        Timestamp = DateTime.UtcNow
                    };

                    _context.AdminLogs.Add(clientLog);
                    _context.Clients.Remove(client);
                    await _context.SaveChangesAsync();

                    message = $"Заказ удален. Клиент ID: {clientId} также удален (последний заказ)";
                    _logger.LogWarning("Клиент ID: {ClientId} удален автоматически после удаления последнего заказа", clientId);
                }
                else
                {
                    message = "Заказ удален";
                }
            }
            else
            {
                message = "Заказ удален";
            }

            await transaction.CommitAsync();

            _logger.LogInformation("Заказ ID: {OrderId} успешно удален", id);

            return Ok(new
            {
                message,
                deletedOrderId = id,
                deletedClientId = shouldDeleteClient ? clientId : null
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Ошибка при удалении заказа ID: {OrderId}", id);

            return StatusCode(500, new
            {
                error = "Ошибка при удалении заказа",
                message = ex.Message
            });
        }
    }
}

public class CreateOrderDto
{
    public int TableId { get; set; }
    public int WaiterId { get; set; }
    public int? BookingId { get; set; }
    public string? Comment { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public int DishId { get; set; }
    public int Quantity { get; set; }
    public string? Comment { get; set; }
}

public class UpdateOrderStatusDto
{
    public string Status { get; set; } = "";
}

