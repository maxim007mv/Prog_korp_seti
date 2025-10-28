namespace Restaurant.Domain.Entities;

public class DishCategory
{
    public int Id { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int DisplayOrder { get; set; } = 0;

    // Navigation properties
    public ICollection<Dish>? Dishes { get; set; }
}
