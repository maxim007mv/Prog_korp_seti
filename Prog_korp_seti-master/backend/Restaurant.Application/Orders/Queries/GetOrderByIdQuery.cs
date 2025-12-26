using MediatR;
using Restaurant.Domain.Common;
using Restaurant.Domain.Entities;
using Restaurant.Application.Interfaces;

namespace Restaurant.Application.Orders.Queries;

/// <summary>
/// Query to get order by ID
/// </summary>
public record GetOrderByIdQuery(int OrderId) : IRequest<Result<OrderDto>>;

public record OrderDto
{
    public int Id { get; init; }
    public int TableId { get; init; }
    public int? WaiterId { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public DateTime CreatedAt { get; init; }
    public List<OrderItemDto> Items { get; init; } = new();
}

public record OrderItemDto
{
    public int Id { get; init; }
    public int DishId { get; init; }
    public string DishName { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal Price { get; init; }
    public decimal Subtotal { get; init; }
}

/// <summary>
/// Handler for GetOrderByIdQuery
/// </summary>
public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, Result<OrderDto>>
{
    private readonly IOrderRepository _orderRepository;

    public GetOrderByIdQueryHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<Result<OrderDto>> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetOrderWithItemsAsync(request.OrderId);

        if (order == null)
            return DomainErrors.Order.NotFound(request.OrderId);

        var dto = new OrderDto
        {
            Id = order.Id,
            TableId = order.TableId,
            WaiterId = order.WaiterId,
            Status = order.Status,
            TotalAmount = order.TotalPrice,
            CreatedAt = order.CreatedAt,
            Items = (order.Items ?? new List<OrderItem>()).Select(i => new OrderItemDto
            {
                Id = i.Id,
                DishId = i.DishId,
                DishName = i.Dish?.Name ?? "Unknown",
                Quantity = i.Quantity,
                Price = i.Price,
                Subtotal = i.Quantity * i.Price
            }).ToList()
        };

        return dto;
    }
}
