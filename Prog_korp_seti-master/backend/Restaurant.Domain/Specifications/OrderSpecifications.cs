using Restaurant.Domain.Common;
using Restaurant.Domain.Entities;

namespace Restaurant.Domain.Specifications;

/// <summary>
/// Specification for filtering orders by status
/// </summary>
public class OrdersByStatusSpecification : Specification<Order>
{
    public OrdersByStatusSpecification(string status)
    {
        Criteria = o => o.Status == status;
        AddInclude(o => o.Items!);
        AddInclude("Items.Dish");
        ApplyOrderByDescending(o => o.CreatedAt);
    }
}

/// <summary>
/// Specification for filtering orders by waiter
/// </summary>
public class OrdersByWaiterSpecification : Specification<Order>
{
    public OrdersByWaiterSpecification(int waiterId)
    {
        Criteria = o => o.WaiterId == waiterId;
        AddInclude(o => o.Items!);
        AddInclude("Items.Dish");
        ApplyOrderByDescending(o => o.CreatedAt);
    }
}

/// <summary>
/// Specification for filtering orders by table
/// </summary>
public class OrdersByTableSpecification : Specification<Order>
{
    public OrdersByTableSpecification(int tableId)
    {
        Criteria = o => o.TableId == tableId;
        AddInclude(o => o.Items!);
        AddInclude("Items.Dish");
        ApplyOrderByDescending(o => o.CreatedAt);
    }
}

/// <summary>
/// Specification for orders within date range
/// </summary>
public class OrdersByDateRangeSpecification : Specification<Order>
{
    public OrdersByDateRangeSpecification(DateTime startDate, DateTime endDate)
    {
        Criteria = o => o.CreatedAt >= startDate && o.CreatedAt <= endDate;
        AddInclude(o => o.Items!);
        ApplyOrderBy(o => o.CreatedAt);
    }
}

/// <summary>
/// Specification for completed orders (for analytics)
/// </summary>
public class CompletedOrdersSpecification : Specification<Order>
{
    public CompletedOrdersSpecification()
    {
        Criteria = o => o.Status == "завершен";
        AddInclude(o => o.Items!);
        AddInclude("Items.Dish");
    }
}
