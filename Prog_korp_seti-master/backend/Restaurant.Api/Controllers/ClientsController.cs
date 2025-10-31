using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Restaurant.Application.DTOs;
using Restaurant.Domain.Entities;
using Restaurant.Infrastructure.Persistence;
using System.Text.Json;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ClientsController> _logger;

    public ClientsController(AppDbContext context, ILogger<ClientsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Создание клиента и его первого заказа в одной транзакции
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ClientWithOrderResponseDto>> CreateClientWithOrder(
        [FromBody] CreateClientWithOrderDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            // 1. Проверяем, существует ли клиент с таким телефоном
            var existingClient = await _context.Clients
                .FirstOrDefaultAsync(c => c.Phone == dto.Phone);

            Client client;
            bool clientCreated = false;

            if (existingClient != null)
            {
                client = existingClient;
                _logger.LogInformation("Используется существующий клиент ID: {ClientId}", client.Id);
            }
            else
            {
                // 2. Создаем нового клиента
                client = new Client
                {
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    Phone = dto.Phone,
                    Email = dto.Email,
                    DateOfBirth = dto.DateOfBirth,
                    RegistrationDate = DateTime.UtcNow
                };

                _context.Clients.Add(client);
                await _context.SaveChangesAsync();
                clientCreated = true;

                _logger.LogInformation("Создан новый клиент ID: {ClientId}, Телефон: {Phone}", 
                    client.Id, client.Phone);
            }

            // 3. Создаем заказ и связываем с клиентом
            var order = new Order
            {
                TableId = dto.TableId,
                WaiterId = dto.WaiterId,
                BookingId = dto.BookingId,
                ClientId = client.Id, // Связываем с клиентом
                Comment = dto.Comment,
                StartTime = DateTime.UtcNow,
                ShiftDate = DateTime.Today,
                Status = "активен",
                IsWalkIn = dto.BookingId == null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Создан заказ ID: {OrderId} для клиента ID: {ClientId}", 
                order.Id, client.Id);

            // 4. Добавляем позиции в заказ
            decimal totalPrice = 0;
            foreach (var itemDto in dto.Items)
            {
                var dish = await _context.Dishes.FindAsync(itemDto.DishId);
                if (dish == null)
                {
                    throw new Exception($"Блюдо ID {itemDto.DishId} не найдено");
                }

                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    DishId = itemDto.DishId,
                    Quantity = itemDto.Quantity,
                    Price = dish.Price,
                    Comment = itemDto.Comment,
                    Status = "заказано"
                };

                _context.OrderItems.Add(orderItem);
                totalPrice += dish.Price * itemDto.Quantity;
            }

            order.TotalPrice = totalPrice;
            await _context.SaveChangesAsync();

            // 5. Логируем создание
            var adminLog = new AdminLog
            {
                AdminUsername = User.Identity?.Name ?? "system",
                Action = "CREATE",
                EntityType = "ClientOrder",
                EntityId = order.Id,
                EntityData = JsonSerializer.Serialize(new { client, order }),
                Comment = clientCreated ? "Создан новый клиент с заказом" : "Создан заказ для существующего клиента",
                Timestamp = DateTime.UtcNow
            };

            _context.AdminLogs.Add(adminLog);
            await _context.SaveChangesAsync();

            // 6. Фиксируем транзакцию
            await transaction.CommitAsync();

            _logger.LogInformation(
                "Транзакция успешно завершена. Клиент ID: {ClientId}, Заказ ID: {OrderId}, Сумма: {TotalPrice}", 
                client.Id, order.Id, totalPrice);

            return Ok(new ClientWithOrderResponseDto
            {
                ClientId = client.Id,
                ClientName = $"{client.FirstName} {client.LastName}",
                Phone = client.Phone,
                OrderId = order.Id,
                TotalPrice = totalPrice,
                CreatedAt = order.CreatedAt
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Ошибка при создании клиента и заказа. Транзакция откачена.");
            
            return StatusCode(500, new { 
                error = "Ошибка при создании клиента и заказа", 
                message = ex.Message 
            });
        }
    }

    /// <summary>
    /// Получение всех клиентов с количеством их заказов
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> GetClients()
    {
        var clients = await _context.Clients
            .Include(c => c.Orders)
            .Select(c => new
            {
                c.Id,
                Name = $"{c.FirstName} {c.LastName}",
                c.Phone,
                c.Email,
                OrdersCount = c.Orders != null ? c.Orders.Count : 0,
                c.LoyaltyPoints,
                c.RegistrationDate
            })
            .OrderByDescending(c => c.RegistrationDate)
            .ToListAsync();

        return Ok(clients);
    }

    /// <summary>
    /// Получение клиента по ID с его заказами
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult> GetClient(int id)
    {
        var client = await _context.Clients
            .Include(c => c.Orders)
            .ThenInclude(o => o.Items)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (client == null)
        {
            return NotFound(new { error = "Клиент не найден" });
        }

        return Ok(new
        {
            client.Id,
            Name = $"{client.FirstName} {client.LastName}",
            client.Phone,
            client.Email,
            client.LoyaltyPoints,
            client.RegistrationDate,
            Orders = client.Orders?.Select(o => new
            {
                o.Id,
                o.StartTime,
                o.EndTime,
                o.TotalPrice,
                o.Status,
                ItemsCount = o.Items?.Count ?? 0
            })
        });
    }

    /// <summary>
    /// Удаление клиента (каскадно удалит все его заказы)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteClient(int id, [FromBody] DeleteOrderRequestDto? request = null)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var client = await _context.Clients
                .Include(c => c.Orders)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (client == null)
            {
                return NotFound(new { error = "Клиент не найден" });
            }

            // Сохраняем snapshot для лога
            var clientSnapshot = JsonSerializer.Serialize(new
            {
                client.Id,
                Name = $"{client.FirstName} {client.LastName}",
                client.Phone,
                OrdersCount = client.Orders?.Count ?? 0
            });

            // Логируем удаление
            var adminLog = new AdminLog
            {
                AdminUsername = User.Identity?.Name ?? "system",
                Action = "DELETE",
                EntityType = "Client",
                EntityId = client.Id,
                EntityData = clientSnapshot,
                Comment = request?.Comment ?? $"Удален клиент с {client.Orders?.Count ?? 0} заказами",
                Timestamp = DateTime.UtcNow
            };

            _context.AdminLogs.Add(adminLog);

            // Удаляем клиента (каскадно удалятся все заказы благодаря ON DELETE CASCADE)
            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogWarning(
                "Удален клиент ID: {ClientId}, Телефон: {Phone}, Удалено заказов: {OrdersCount}",
                client.Id, client.Phone, client.Orders?.Count ?? 0);

            return Ok(new
            {
                message = "Клиент и все его заказы успешно удалены",
                deletedClientId = client.Id,
                deletedOrdersCount = client.Orders?.Count ?? 0
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Ошибка при удалении клиента ID: {ClientId}", id);
            
            return StatusCode(500, new { 
                error = "Ошибка при удалении клиента", 
                message = ex.Message 
            });
        }
    }
}
