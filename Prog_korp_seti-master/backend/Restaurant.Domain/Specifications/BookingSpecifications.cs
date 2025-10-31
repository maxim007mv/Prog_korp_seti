using Restaurant.Domain.Common;
using Restaurant.Domain.Entities;

namespace Restaurant.Domain.Specifications;

/// <summary>
/// Specification for active bookings
/// </summary>
public class ActiveBookingsSpecification : Specification<Booking>
{
    public ActiveBookingsSpecification()
    {
        Criteria = b => b.Status == "активно";
        AddInclude(b => b.Table!);
        ApplyOrderBy(b => b.StartTime);
    }
}

/// <summary>
/// Specification for bookings by table
/// </summary>
public class BookingsByTableSpecification : Specification<Booking>
{
    public BookingsByTableSpecification(int tableId)
    {
        Criteria = b => b.TableId == tableId;
        ApplyOrderByDescending(b => b.StartTime);
    }
}

/// <summary>
/// Specification for bookings by date range
/// </summary>
public class BookingsByDateRangeSpecification : Specification<Booking>
{
    public BookingsByDateRangeSpecification(DateTime startDate, DateTime endDate)
    {
        Criteria = b => b.StartTime >= startDate && b.EndTime <= endDate;
        AddInclude(b => b.Table!);
        ApplyOrderBy(b => b.StartTime);
    }
}

/// <summary>
/// Specification for searching bookings by client info
/// </summary>
public class BookingSearchSpecification : Specification<Booking>
{
    public BookingSearchSpecification(string? clientName, string? clientPhone, string? status)
    {
        Criteria = b => 
            (string.IsNullOrEmpty(clientName) || b.ClientName.Contains(clientName)) &&
            (string.IsNullOrEmpty(clientPhone) || b.ClientPhone.Contains(clientPhone)) &&
            (string.IsNullOrEmpty(status) || b.Status == status);

        AddInclude(b => b.Table!);
        ApplyOrderByDescending(b => b.StartTime);
    }
}
