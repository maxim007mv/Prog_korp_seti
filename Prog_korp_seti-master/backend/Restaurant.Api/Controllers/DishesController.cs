using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Restaurant.Infrastructure.Persistence;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DishesController : ControllerBase
{
    private readonly AppDbContext _context;

    public DishesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? categoryId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _context.Dishes
            .Include(d => d.Category)
            .Include(d => d.Types)
            .Where(d => !d.IsDeleted);

        if (categoryId.HasValue)
        {
            query = query.Where(d => d.CategoryId == categoryId.Value);
        }

        var total = await query.CountAsync();
        var dishes = await query
            .OrderBy(d => d.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new
            {
                d.Id,
                d.Name,
                d.Composition,
                d.Weight,
                d.Price,
                CategoryId = d.CategoryId,
                Category = d.Category != null ? d.Category.CategoryName : "Unknown",
                d.CookingTime,
                d.IsAvailable,
                Tags = d.Types != null ? d.Types.Select(t => t.TypeName).ToArray() : Array.Empty<string>(),
                d.ImageUrl
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, data = dishes });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var dish = await _context.Dishes
            .Include(d => d.Category)
            .Include(d => d.Types)
            .Where(d => d.Id == id && !d.IsDeleted)
            .Select(d => new
            {
                d.Id,
                d.Name,
                d.Composition,
                d.Weight,
                d.Price,
                CategoryId = d.CategoryId,
                Category = d.Category != null ? d.Category.CategoryName : "Unknown",
                d.CookingTime,
                d.IsAvailable,
                Tags = d.Types != null ? d.Types.Select(t => t.TypeName).ToArray() : Array.Empty<string>(),
                d.ImageUrl
            })
            .FirstOrDefaultAsync();

        if (dish == null)
            return NotFound();

        return Ok(dish);
    }

    [HttpGet("categories/stats")]
    public async Task<IActionResult> GetCategoryStats()
    {
        var stats = await _context.DishCategories
            .Select(c => new
            {
                CategoryId = c.Id,
                CategoryName = c.CategoryName,
                DisplayOrder = c.DisplayOrder,
                DishCount = c.Dishes != null ? c.Dishes.Count(d => !d.IsDeleted) : 0,
                AvailableCount = c.Dishes != null ? c.Dishes.Count(d => !d.IsDeleted && d.IsAvailable) : 0,
                AvgPrice = c.Dishes != null && c.Dishes.Any(d => !d.IsDeleted) ? c.Dishes.Where(d => !d.IsDeleted).Average(d => d.Price) : 0,
                MinPrice = c.Dishes != null && c.Dishes.Any(d => !d.IsDeleted) ? c.Dishes.Where(d => !d.IsDeleted).Min(d => d.Price) : 0,
                MaxPrice = c.Dishes != null && c.Dishes.Any(d => !d.IsDeleted) ? c.Dishes.Where(d => !d.IsDeleted).Max(d => d.Price) : 0
            })
            .OrderBy(x => x.DisplayOrder)
            .ToListAsync();

        return Ok(stats);
    }
}

