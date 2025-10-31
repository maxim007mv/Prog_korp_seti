using Restaurant.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Serilog.Context;

namespace Restaurant.Api.BackgroundJobs;

/// <summary>
/// Background job for warming up cache with frequently accessed data
/// </summary>
public class CacheWarmupJob
{
    private readonly AppDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly ILogger<CacheWarmupJob> _logger;

    public CacheWarmupJob(AppDbContext context, IMemoryCache cache, ILogger<CacheWarmupJob> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        using (LogContext.PushProperty("JobName", "CacheWarmup"))
        {
            _logger.LogInformation("Starting cache warmup");

            // Warm up menu cache
            var dishes = await _context.Dishes
                .Where(d => d.IsAvailable && !d.IsDeleted)
                .Include(d => d.Category)
                .ToListAsync();

            _cache.Set("menu_all", dishes, TimeSpan.FromMinutes(10));
            _logger.LogInformation("Warmed up menu cache with {Count} dishes", dishes.Count);

            // Warm up categories cache
            var categories = await _context.DishCategories
                .ToListAsync();

            _cache.Set("categories_all", categories, TimeSpan.FromHours(1));
            _logger.LogInformation("Warmed up categories cache with {Count} categories", categories.Count);

            // Warm up active tables cache
            var tables = await _context.Tables
                .Where(t => t.IsActive)
                .ToListAsync();

            _cache.Set("tables_active", tables, TimeSpan.FromMinutes(5));
            _logger.LogInformation("Warmed up tables cache with {Count} active tables", tables.Count);

            _logger.LogInformation("Cache warmup completed successfully");
        }
    }
}
