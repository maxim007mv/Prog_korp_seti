using Restaurant.Domain.Common;
using Restaurant.Domain.Entities;

namespace Restaurant.Domain.Specifications;

/// <summary>
/// Specification for active tables
/// </summary>
public class ActiveTablesSpecification : Specification<Table>
{
    public ActiveTablesSpecification()
    {
        Criteria = t => t.IsActive;
        ApplyOrderBy(t => t.Location);
    }
}

/// <summary>
/// Specification for tables by capacity
/// </summary>
public class TablesByCapacitySpecification : Specification<Table>
{
    public TablesByCapacitySpecification(int minSeats)
    {
        Criteria = t => t.IsActive && t.Seats >= minSeats;
        ApplyOrderBy(t => t.Seats);
    }
}

/// <summary>
/// Specification for available tables (not currently booked)
/// </summary>
public class AvailableTablesSpecification : Specification<Table>
{
    public AvailableTablesSpecification(DateTime startTime, DateTime endTime)
    {
        Criteria = t => t.IsActive && 
            !t.Bookings!.Any(b => 
                b.Status == "активно" &&
                ((b.StartTime <= startTime && b.EndTime > startTime) ||
                 (b.StartTime < endTime && b.EndTime >= endTime) ||
                 (b.StartTime >= startTime && b.EndTime <= endTime)));
        
        AddInclude(t => t.Bookings!);
        ApplyOrderBy(t => t.Location);
    }
}
