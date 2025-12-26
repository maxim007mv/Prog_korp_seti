namespace Restaurant.Domain.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;

    // Navigation
    public ICollection<Dish>? Dishes { get; set; }
}
