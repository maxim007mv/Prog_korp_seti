namespace Restaurant.Domain.Entities;

public class DishType
{
    public int Id { get; set; }
    public string TypeName { get; set; } = string.Empty;

    // Navigation properties - many-to-many with Dishes
    public ICollection<Dish>? Dishes { get; set; }
}
