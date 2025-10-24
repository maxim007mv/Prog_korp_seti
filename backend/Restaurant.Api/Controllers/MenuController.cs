using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Restaurant.Infrastructure.Persistence;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly AppDbContext _context;

    public MenuController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetMenu([FromQuery] int? categoryId)
    {
        var query = _context.Dishes
            .AsNoTracking()
            .Include(d => d.Category)
            // Include не обязателен при проекции, но оставим для явности
            .Include(d => d.Types)
            .Where(d => !d.IsDeleted && d.IsAvailable);

        if (categoryId.HasValue)
        {
            query = query.Where(d => d.CategoryId == categoryId.Value);
        }

        var dishes = await query
            .OrderBy(d => d.Name)
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
            .ToListAsync();

        // Get all categories
        var categories = await _context.DishCategories
            .AsNoTracking()
            .OrderBy(c => c.DisplayOrder)
            .Select(c => c.CategoryName)
            .ToListAsync();

        return Ok(new { categories, dishes });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDish(int id)
    {
        var dish = await _context.Dishes
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

        return Ok(dish);
    }
}

