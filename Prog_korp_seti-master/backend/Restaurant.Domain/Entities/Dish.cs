namespace Restaurant.Domain.Entities;

public class Dish
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Composition { get; set; } = default!;
    public string Weight { get; set; } = default!;
    public decimal Price { get; set; }
    public int CategoryId { get; set; } // Foreign key to DishCategory
    public int CookingTime { get; set; }
    public bool IsAvailable { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public DishCategory? Category { get; set; }
    public ICollection<DishType>? Types { get; set; } // Many-to-many
    public ICollection<OrderItem>? OrderItems { get; set; }
}

