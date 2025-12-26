using Restaurant.Domain.Entities;

namespace Restaurant.Application.Interfaces;

public interface IOrderRepository : IRepository<Order>
{
    Task<IEnumerable<Order>> GetOrdersByTableIdAsync(int tableId);
    Task<IEnumerable<Order>> GetOrdersByStatusAsync(string status);
    Task<IEnumerable<Order>> GetOrdersByWaiterIdAsync(int waiterId);
    Task<Order?> GetOrderWithItemsAsync(int orderId);
}

public interface IBookingRepository : IRepository<Booking>
{
    Task<IEnumerable<Booking>> GetBookingsByTableIdAsync(int tableId);
    Task<IEnumerable<Booking>> GetBookingsByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<Booking>> GetActiveBookingsAsync();
    Task<bool> IsTableAvailableAsync(int tableId, DateTime startTime, DateTime endTime);
}

public interface IDishRepository : IRepository<Dish>
{
    Task<IEnumerable<Dish>> GetDishesByCategoryAsync(int categoryId);
    Task<IEnumerable<Dish>> GetAvailableDishesAsync();
    Task<Dish?> GetDishWithDetailsAsync(int dishId);
}

public interface ITableRepository : IRepository<Table>
{
    Task<IEnumerable<Table>> GetActiveTablesAsync();
    Task<IEnumerable<Table>> GetTablesBySeatsAsync(int minSeats);
}

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<bool> UsernameExistsAsync(string username);
}
