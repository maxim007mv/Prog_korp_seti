using Restaurant.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Serilog.Context;

namespace Restaurant.Api.BackgroundJobs;

/// <summary>
/// Background job for generating daily reports
/// </summary>
public class DailyReportsJob
{
    private readonly AppDbContext _context;
    private readonly ILogger<DailyReportsJob> _logger;

    public DailyReportsJob(AppDbContext context, ILogger<DailyReportsJob> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        using (LogContext.PushProperty("JobName", "DailyReports"))
        {
            _logger.LogInformation("Starting daily reports generation");

            var today = DateTime.UtcNow.Date;
            var yesterday = today.AddDays(-1);

            // Calculate daily metrics
            var totalOrders = await _context.Orders
                .Where(o => o.CreatedAt >= yesterday && o.CreatedAt < today)
                .CountAsync();

            var totalRevenue = await _context.Orders
                .Where(o => o.CreatedAt >= yesterday && o.CreatedAt < today && o.Status == "завершен")
                .SumAsync(o => (decimal?)o.TotalPrice) ?? 0;

            var totalBookings = await _context.Bookings
                .Where(b => b.CreatedAt >= yesterday && b.CreatedAt < today)
                .CountAsync();

            var averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            _logger.LogInformation(
                "Daily Report for {Date}: Orders={Orders}, Revenue={Revenue:C}, Bookings={Bookings}, AvgOrder={AvgOrder:C}",
                yesterday.ToString("yyyy-MM-dd"),
                totalOrders,
                totalRevenue,
                totalBookings,
                averageOrderValue
            );

            // Here you could save to a Reports table or send email/notification
            // For now, just logging the metrics
        }
    }
}
