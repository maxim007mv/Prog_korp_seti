namespace Restaurant.Domain.Entities;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int DishId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; } // цена на момент заказа
    public string? Comment { get; set; }
    public string Status { get; set; } = "заказано"; // заказано, готовится, готов, подано

    // Computed property - calculated by database
    public decimal ItemTotal => Quantity * Price;

    // Navigation properties
    public Order? Order { get; set; }
    public Dish? Dish { get; set; }
}

