namespace Restaurant.Domain.Entities;

public class Order
{
    public int Id { get; set; }
    public int TableId { get; set; }
    public int? WaiterId { get; set; }
    public int? BookingId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string? Comment { get; set; }
    public decimal TotalPrice { get; set; } = 0;
    public string Status { get; set; } = "активен"; // активен, готовится, готов, закрыт, отменен
    public bool IsWalkIn { get; set; } = false;
    public DateTime ShiftDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Table? Table { get; set; }
    public Waiter? Waiter { get; set; }
    public Booking? Booking { get; set; }
    public ICollection<OrderItem>? Items { get; set; }
}

