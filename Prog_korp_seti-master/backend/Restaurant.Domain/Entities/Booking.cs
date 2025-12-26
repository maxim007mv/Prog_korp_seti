namespace Restaurant.Domain.Entities;

public class Booking
{
    public int Id { get; set; }
    public int TableId { get; set; }
    public int? ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ClientPhone { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Comment { get; set; }
    public string Status { get; set; } = "активно"; // активно, завершено, отменено, конвертировано
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Table? Table { get; set; }
    public Client? Client { get; set; }
    public ICollection<Order>? Orders { get; set; }
}

