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
            .Select(o => new
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
                    DishName = i.Dish != null ? i.Dish.Name : "",
                    i.Quantity,
                    i.Price,
                    Subtotal = i.Quantity * i.Price
                }).ToList()
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Items!)
                .ThenInclude(i => i.Dish)
            .Where(o => o.Id == id)
            .Select(o => new
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
                    DishName = i.Dish != null ? i.Dish.Name : "",
                    i.Quantity,
                    i.Price,
                    Subtotal = i.Quantity * i.Price
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (order == null)
        {
            return NotFound();
        }

        return Ok(order);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        var order = new Order
        {
            TableId = dto.TableId,
            WaiterId = dto.WaiterId,
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
                Price = dish.Price
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
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public int DishId { get; set; }
    public int Quantity { get; set; }
}

public class UpdateOrderStatusDto
{
    public string Status { get; set; } = "";
}

