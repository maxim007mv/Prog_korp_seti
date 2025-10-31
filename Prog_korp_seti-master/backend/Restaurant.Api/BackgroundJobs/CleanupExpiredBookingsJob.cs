using Restaurant.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Serilog.Context;

namespace Restaurant.Api.BackgroundJobs;

/// <summary>
/// Background job for cleaning up expired bookings
/// </summary>
public class CleanupExpiredBookingsJob
{
    private readonly AppDbContext _context;
    private readonly ILogger<CleanupExpiredBookingsJob> _logger;

    public CleanupExpiredBookingsJob(AppDbContext context, ILogger<CleanupExpiredBookingsJob> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        using (LogContext.PushProperty("JobName", "CleanupExpiredBookings"))
        {
            _logger.LogInformation("Starting cleanup of expired bookings");

            var expiredDate = DateTime.UtcNow.AddHours(-2); // Bookings older than 2 hours after end time

            var expiredBookings = await _context.Bookings
                .Where(b => b.Status == "активно" && b.EndTime < expiredDate)
                .ToListAsync();

            if (expiredBookings.Count == 0)
            {
                _logger.LogInformation("No expired bookings found");
                return;
            }

            foreach (var booking in expiredBookings)
            {
                booking.Status = "завершено";
                booking.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Cleaned up {Count} expired bookings", expiredBookings.Count);
        }
    }
}
