using Microsoft.Extensions.Caching.Memory;

namespace Restaurant.Api.Services;

/// <summary>
/// Сервис для управления кэшем приложения
/// </summary>
public interface ICacheService
{
    void InvalidateMenu();
    void InvalidateDish(int dishId);
    void InvalidateCategories();
    void InvalidateAll();
}

public class CacheService : ICacheService
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<CacheService> _logger;

    // Ключи кэша (синхронизированы с MenuController)
    private const string MenuCacheKeyPrefix = "menu_";
    private const string CategoriesCacheKey = "categories_all";
    private const string DishCacheKeyPrefix = "dish_";

    public CacheService(IMemoryCache cache, ILogger<CacheService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    /// <summary>
    /// Инвалидация всего кэша меню
    /// </summary>
    public void InvalidateMenu()
    {
        // Удаляем все варианты кэша меню (с фильтрами и без)
        _cache.Remove("menu_all");
        
        // Можно также удалить кэш по категориям, если нужно
        // Для этого нужно отслеживать все созданные ключи
        
        _logger.LogInformation("Menu cache invalidated");
    }

    /// <summary>
    /// Инвалидация кэша конкретного блюда
    /// </summary>
    public void InvalidateDish(int dishId)
    {
        _cache.Remove($"{DishCacheKeyPrefix}{dishId}");
        _logger.LogInformation("Dish cache invalidated for ID: {DishId}", dishId);
    }

    /// <summary>
    /// Инвалидация кэша категорий
    /// </summary>
    public void InvalidateCategories()
    {
        _cache.Remove(CategoriesCacheKey);
        _logger.LogInformation("Categories cache invalidated");
    }

    /// <summary>
    /// Полная очистка кэша (для критических обновлений)
    /// </summary>
    public void InvalidateAll()
    {
        // Инвалидируем все известные ключи
        InvalidateMenu();
        InvalidateCategories();
        _logger.LogWarning("All cache invalidated");
    }
}
