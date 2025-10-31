namespace Restaurant.Application.DTOs;

/// <summary>
/// DTO для блюда в меню (соответствует типу Dish на фронтенде)
/// </summary>
public class DishDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Composition { get; set; } = string.Empty;
    public string Weight { get; set; } = string.Empty;
    public decimal Price { get; set; }
    
    /// <summary>
    /// Название категории (строка, не ID!)
    /// </summary>
    public string Category { get; set; } = string.Empty;
    
    public int CategoryId { get; set; }
    public int CookingTime { get; set; }
    
    /// <summary>
    /// Массив тегов (названия типов блюд)
    /// </summary>
    public string[] Tags { get; set; } = Array.Empty<string>();
    
    public string? ImageUrl { get; set; }
}

/// <summary>
/// DTO для меню с категориями (соответствует типу MenuData на фронтенде)
/// </summary>
public class MenuDto
{
    /// <summary>
    /// Список названий категорий
    /// </summary>
    public string[] Categories { get; set; } = Array.Empty<string>();
    
    /// <summary>
    /// Список блюд
    /// </summary>
    public List<DishDto> Dishes { get; set; } = new();
}
