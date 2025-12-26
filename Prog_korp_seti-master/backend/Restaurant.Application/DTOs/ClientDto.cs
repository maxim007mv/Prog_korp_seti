namespace Restaurant.Application.DTOs;

/// <summary>
/// DTO для создания клиента с первым заказом
/// </summary>
public class CreateClientWithOrderDto
{
    // Данные клиента
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public DateTime? DateOfBirth { get; set; }
    
    // Данные первого заказа
    public int TableId { get; set; }
    public int? WaiterId { get; set; }
    public int? BookingId { get; set; }
    public string? Comment { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

/// <summary>
/// DTO для позиции в заказе
/// </summary>
public class OrderItemDto
{
    public int DishId { get; set; }
    public int Quantity { get; set; } = 1;
    public string? Comment { get; set; }
}

/// <summary>
/// DTO ответа при создании клиента с заказом
/// </summary>
public class ClientWithOrderResponseDto
{
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int OrderId { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO для удаления заказа с логированием
/// </summary>
public class DeleteOrderRequestDto
{
    public int AdminId { get; set; }
    public string? Comment { get; set; }
    public bool DeleteClientIfLastOrder { get; set; } = true;
}
