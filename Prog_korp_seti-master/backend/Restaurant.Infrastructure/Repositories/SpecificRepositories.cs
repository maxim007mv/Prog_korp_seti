using Microsoft.EntityFrameworkCore;
using Restaurant.Application.Interfaces;
using Restaurant.Domain.Entities;
using Restaurant.Infrastructure.Persistence;

namespace Restaurant.Infrastructure.Repositories;

public class OrderRepository : Repository<Order>, IOrderRepository
{
    public OrderRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Order>> GetOrdersByTableIdAsync(int tableId)
    {
        return await _dbSet
            .Where(o => o.TableId == tableId)
            .Include(o => o.Items!)
                .ThenInclude(i => i.Dish)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Order>> GetOrdersByStatusAsync(string status)
    {
        return await _dbSet
            .Where(o => o.Status == status)
            .Include(o => o.Items!)
                .ThenInclude(i => i.Dish)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Order>> GetOrdersByWaiterIdAsync(int waiterId)
    {
        return await _dbSet
            .Where(o => o.WaiterId == waiterId)
            .Include(o => o.Items!)
                .ThenInclude(i => i.Dish)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<Order?> GetOrderWithItemsAsync(int orderId)
    {
        return await _dbSet
            .Include(o => o.Items!)
                .ThenInclude(i => i.Dish)
            .Include(o => o.Table)
            .Include(o => o.Waiter)
            .FirstOrDefaultAsync(o => o.Id == orderId);
    }
}

public class BookingRepository : Repository<Booking>, IBookingRepository
{
    public BookingRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Booking>> GetBookingsByTableIdAsync(int tableId)
    {
        return await _dbSet
            .Where(b => b.TableId == tableId)
            .Include(b => b.Table)
            .Include(b => b.Client)
            .OrderBy(b => b.StartTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetBookingsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _dbSet
            .Where(b => b.StartTime >= startDate && b.StartTime <= endDate)
            .Include(b => b.Table)
            .Include(b => b.Client)
            .OrderBy(b => b.StartTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetActiveBookingsAsync()
    {
        return await _dbSet
            .Where(b => b.Status == "активно")
            .Include(b => b.Table)
            .Include(b => b.Client)
            .OrderBy(b => b.StartTime)
            .ToListAsync();
    }

    public async Task<bool> IsTableAvailableAsync(int tableId, DateTime startTime, DateTime endTime)
    {
        var conflictingBooking = await _dbSet
            .AnyAsync(b => 
                b.TableId == tableId &&
                b.Status == "активно" &&
                ((b.StartTime >= startTime && b.StartTime < endTime) ||
                 (b.EndTime > startTime && b.EndTime <= endTime) ||
                 (b.StartTime <= startTime && b.EndTime >= endTime)));

        return !conflictingBooking;
    }
}

public class DishRepository : Repository<Dish>, IDishRepository
{
    public DishRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Dish>> GetDishesByCategoryAsync(int categoryId)
    {
        return await _dbSet
            .Where(d => d.CategoryId == categoryId && !d.IsDeleted)
            .Include(d => d.Category)
            .Include(d => d.Types)
            .ToListAsync();
    }

    public async Task<IEnumerable<Dish>> GetAvailableDishesAsync()
    {
        return await _dbSet
            .Where(d => d.IsAvailable && !d.IsDeleted)
            .Include(d => d.Category)
            .Include(d => d.Types)
            .ToListAsync();
    }

    public async Task<Dish?> GetDishWithDetailsAsync(int dishId)
    {
        return await _dbSet
            .Include(d => d.Category)
            .Include(d => d.Types)
            .FirstOrDefaultAsync(d => d.Id == dishId && !d.IsDeleted);
    }
}

public class TableRepository : Repository<Table>, ITableRepository
{
    public TableRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Table>> GetActiveTablesAsync()
    {
        return await _dbSet
            .Where(t => t.IsActive)
            .OrderBy(t => t.Location)
            .ToListAsync();
    }

    public async Task<IEnumerable<Table>> GetTablesBySeatsAsync(int minSeats)
    {
        return await _dbSet
            .Where(t => t.IsActive && t.Seats >= minSeats)
            .OrderBy(t => t.Seats)
            .ToListAsync();
    }
}

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<bool> UsernameExistsAsync(string username)
    {
        return await _dbSet
            .AnyAsync(u => u.Username == username);
    }
}
