namespace Restaurant.Application.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IOrderRepository Orders { get; }
    IBookingRepository Bookings { get; }
    IDishRepository Dishes { get; }
    ITableRepository Tables { get; }
    IUserRepository Users { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
