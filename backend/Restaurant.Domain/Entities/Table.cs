namespace Restaurant.Domain.Entities;

public class Table
{
    public int Id { get; set; }
    public string Location { get; set; } = string.Empty;
    public int Seats { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<Booking>? Bookings { get; set; }
    public ICollection<Order>? Orders { get; set; }
}

