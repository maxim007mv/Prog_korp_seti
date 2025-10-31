using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Restaurant.Infrastructure.Persistence;
using Restaurant.Application.DTOs;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly ILogger<MenuController> _logger;
    
    // Ключи для кэша
    private const string MenuCacheKey = "menu_all";
    private const string CategoriesCacheKey = "categories_all";
    private const string DishCacheKeyPrefix = "dish_";
    
    // Время жизни кэша
    private static readonly TimeSpan MenuCacheExpiration = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan CategoriesCacheExpiration = TimeSpan.FromHours(1);
    private static readonly TimeSpan DishCacheExpiration = TimeSpan.FromMinutes(15);

    public MenuController(
        AppDbContext context, 
        IMemoryCache cache,
        ILogger<MenuController> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetMenu([FromQuery] int? categoryId)
    {
        // Для запросов с фильтром по категории не используем кэш (или создаем отдельные ключи)
        var cacheKey = categoryId.HasValue 
            ? $"{MenuCacheKey}_category_{categoryId.Value}" 
            : MenuCacheKey;

        // Пытаемся получить из кэша
        if (_cache.TryGetValue(cacheKey, out object? cachedMenu))
        {
            _logger.LogDebug("Menu cache hit for key: {CacheKey}", cacheKey);
            return Ok(cachedMenu);
        }

        _logger.LogDebug("Menu cache miss for key: {CacheKey}. Loading from database...", cacheKey);

        var query = _context.Dishes
            .AsNoTracking()
            .Include(d => d.Category)
            .Include(d => d.Types)
            .Where(d => !d.IsDeleted && d.IsAvailable);

        if (categoryId.HasValue)
        {
            query = query.Where(d => d.CategoryId == categoryId.Value);
        }

        var dishes = await query
            .OrderBy(d => d.Name)
            .Select(d => new DishDto
            {
                Id = d.Id,
                Name = d.Name,
                Composition = d.Composition,
                Weight = d.Weight,
                Price = d.Price,
                Category = d.Category != null ? d.Category.CategoryName : "Unknown",
                CategoryId = d.CategoryId,
                CookingTime = d.CookingTime,
                Tags = d.Types != null ? d.Types.Select(t => t.TypeName).ToArray() : Array.Empty<string>(),
                ImageUrl = d.ImageUrl
            })
            .ToListAsync();

        // Get all categories (с отдельным кэшем)
        var categories = await GetCategoriesAsync();

        var result = new MenuDto
        {
            Categories = categories.ToArray(),
            Dishes = dishes
        };

        // Сохраняем в кэш
        var cacheOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(MenuCacheExpiration)
            .SetPriority(CacheItemPriority.High); // Высокий приоритет для меню

        _cache.Set(cacheKey, result, cacheOptions);
        _logger.LogInformation("Menu cached with key: {CacheKey}", cacheKey);

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDish(int id)
    {
        var cacheKey = $"{DishCacheKeyPrefix}{id}";

        // Проверяем кэш
        if (_cache.TryGetValue(cacheKey, out object? cachedDish))
        {
            _logger.LogDebug("Dish cache hit for ID: {DishId}", id);
            return Ok(cachedDish);
        }

        _logger.LogDebug("Dish cache miss for ID: {DishId}. Loading from database...", id);

        var dish = await _context.Dishes
            .AsNoTracking()
            .Include(d => d.Category)
            .Include(d => d.Types)
            .Where(d => d.Id == id && !d.IsDeleted)
            .Select(d => new
            {
                id = d.Id,
                name = d.Name,
                composition = d.Composition,
                weight = d.Weight,
                price = d.Price,
                category = d.Category != null ? d.Category.CategoryName : "Unknown",
                categoryId = d.CategoryId,
                cookingTime = d.CookingTime,
                tags = d.Types != null ? d.Types.Select(t => t.TypeName).ToArray() : Array.Empty<string>(),
                imageUrl = d.ImageUrl
            })
            .FirstOrDefaultAsync();

        if (dish == null)
            return NotFound();

        // Кэшируем блюдо
        var cacheOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(DishCacheExpiration)
            .SetPriority(CacheItemPriority.Normal);

        _cache.Set(cacheKey, dish, cacheOptions);
        _logger.LogDebug("Dish cached with ID: {DishId}", id);

        return Ok(dish);
    }

    /// <summary>
    /// Вспомогательный метод для получения категорий с кэшированием
    /// </summary>
    private async Task<List<string>> GetCategoriesAsync()
    {
        if (_cache.TryGetValue(CategoriesCacheKey, out List<string>? cachedCategories))
        {
            _logger.LogDebug("Categories cache hit");
            return cachedCategories!;
        }

        _logger.LogDebug("Categories cache miss. Loading from database...");

        var categories = await _context.DishCategories
            .AsNoTracking()
            .OrderBy(c => c.DisplayOrder)
            .Select(c => c.CategoryName)
            .ToListAsync();

        var cacheOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(CategoriesCacheExpiration)
            .SetPriority(CacheItemPriority.High);

        _cache.Set(CategoriesCacheKey, categories, cacheOptions);
        _logger.LogInformation("Categories cached. Count: {Count}", categories.Count);

        return categories;
    }

    /// <summary>
    /// Инвалидация кэша меню (вызывать при изменении блюд)
    /// </summary>
    [NonAction]
    public void InvalidateMenuCache()
    {
        _cache.Remove(MenuCacheKey);
        _logger.LogInformation("Menu cache invalidated");
    }

    /// <summary>
    /// Инвалидация кэша конкретного блюда
    /// </summary>
    [NonAction]
    public void InvalidateDishCache(int dishId)
    {
        _cache.Remove($"{DishCacheKeyPrefix}{dishId}");
        _logger.LogInformation("Dish cache invalidated for ID: {DishId}", dishId);
    }
}

