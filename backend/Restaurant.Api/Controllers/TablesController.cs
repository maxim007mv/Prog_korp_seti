using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Restaurant.Infrastructure.Persistence;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/tables")]
public class TablesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<TablesController> _logger;

    public TablesController(AppDbContext context, ILogger<TablesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetTables()
    {
        var tables = await _context.Tables
            .Select(t => new
            {
                t.Id,
                Number = t.Location,
                Capacity = t.Seats,
                IsAvailable = t.IsActive
            })
            .ToListAsync();

        return Ok(tables);
    }

    [HttpGet("available")]
    public async Task<IActionResult> GetAvailableTables([FromQuery] DateTime? startTime, [FromQuery] DateTime? endTime)
    {
        var query = _context.Tables.AsQueryable();

        if (startTime.HasValue && endTime.HasValue)
        {
            // Фильтруем столы, которые не забронированы в указанное время
            var bookedTableIds = await _context.Bookings
                .Where(b => b.Status != "cancelled" &&
                           ((b.StartTime >= startTime && b.StartTime < endTime) ||
                            (b.EndTime > startTime && b.EndTime <= endTime) ||
                            (b.StartTime <= startTime && b.EndTime >= endTime)))
                .Select(b => b.TableId)
                .Distinct()
                .ToListAsync();

            query = query.Where(t => !bookedTableIds.Contains(t.Id));
        }

        var tables = await query
            .Select(t => new
            {
                t.Id,
                Number = t.Location,
                Capacity = t.Seats,
                IsAvailable = t.IsActive
            })
            .ToListAsync();

        return Ok(tables);
    }
}
