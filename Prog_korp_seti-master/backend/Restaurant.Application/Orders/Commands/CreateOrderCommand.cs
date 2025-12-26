using MediatR;
using Restaurant.Domain.Common;
using Restaurant.Domain.Entities;
using Restaurant.Application.Interfaces;

namespace Restaurant.Application.Orders.Commands;

/// <summary>
/// Command to create a new order
/// </summary>
public record CreateOrderCommand : IRequest<Result<int>>
{
    public int TableId { get; init; }
    public int? WaiterId { get; init; }
    public int? BookingId { get; init; }
    public string? Comment { get; init; }
    public List<OrderItemDto> Items { get; init; } = new();
}

public record OrderItemDto
{
    public int DishId { get; init; }
    public int Quantity { get; init; }
    public string? Comment { get; init; }
}

/// <summary>
/// Handler for CreateOrderCommand
/// </summary>
public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Result<int>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IDishRepository _dishRepository;

    public CreateOrderCommandHandler(
        IOrderRepository orderRepository,
        IDishRepository dishRepository)
    {
        _orderRepository = orderRepository;
        _dishRepository = dishRepository;
    }

    public async Task<Result<int>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // Validation
        if (request.Items.Count == 0)
            return DomainErrors.Order.EmptyItems;

        // Create order
        var order = new Order
        {
            TableId = request.TableId,
            WaiterId = request.WaiterId ?? 1, // Default waiter
            BookingId = request.BookingId,
            Comment = request.Comment,
            Status = "pending",
            TotalPrice = 0,
            StartTime = DateTime.UtcNow,
            ShiftDate = DateTime.UtcNow.Date,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Items = new List<OrderItem>()
        };

        decimal total = 0;
        foreach (var item in request.Items)
        {
            var dish = await _dishRepository.GetByIdAsync(item.DishId);
            if (dish == null)
                return DomainErrors.Dish.NotFound(item.DishId);

            if (!dish.IsAvailable)
                return DomainErrors.Dish.NotAvailable;

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

        await _orderRepository.AddAsync(order);

        return order.Id;
    }
}
