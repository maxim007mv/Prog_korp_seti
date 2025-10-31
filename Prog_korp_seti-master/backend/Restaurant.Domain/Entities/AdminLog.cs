namespace Restaurant.Domain.Entities;

/// <summary>
/// Лог административных операций (создание, обновление, удаление)
/// </summary>
public class AdminLog
{
    public int Id { get; set; }
    public int? AdminId { get; set; }
    public string AdminUsername { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // CREATE, UPDATE, DELETE
    public string EntityType { get; set; } = string.Empty; // Order, Booking, Client
    public int? EntityId { get; set; }
    public string? EntityData { get; set; } // JSON snapshot до удаления
    public string? Comment { get; set; }
    public DateTime Timestamp { get; set; }

    // Navigation properties
    public User? Admin { get; set; }
}
