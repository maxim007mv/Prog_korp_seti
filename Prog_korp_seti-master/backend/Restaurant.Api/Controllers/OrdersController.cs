using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Restaurant.Infrastructure.Persistence;
using Restaurant.Domain.Entities;

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
        _logger.LogInformation($"CreateOrder called with WaiterId={dto.WaiterId}, TableId={dto.TableId}");

        // Если WaiterId не указан или равен 0, берем первого доступного официанта
        int? waiterId = dto.WaiterId;
        if (waiterId == 0)
        {
            _logger.LogInformation("WaiterId is 0, searching for available waiter from waiters table...");
            // Ищем waiter_id из таблицы waiters (не users!)
            var waiterRecord = await _context.Set<Restaurant.Domain.Entities.Waiter>()
                .Where(w => w.IsActive)
                .FirstOrDefaultAsync();
            
            if (waiterRecord != null)
            {
                waiterId = waiterRecord.Id;
                _logger.LogInformation($"Found waiter from waiters table: waiter_id={waiterId}");
            }
            else
            {
                _logger.LogWarning("No active waiters found in waiters table, setting waiter_id to null");
                waiterId = null;
            }
        }

        _logger.LogInformation($"Using waiterId={waiterId} for order creation");

        var order = new Order
        {
            TableId = dto.TableId,
            WaiterId = waiterId, // Может быть null
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

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, new { id = order.Id });
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

