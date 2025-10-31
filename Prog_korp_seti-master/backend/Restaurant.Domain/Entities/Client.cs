namespace Restaurant.Domain.Entities;

public class Client
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public int LoyaltyPoints { get; set; } = 0;
    public DateTime RegistrationDate { get; set; }

    // Navigation properties
    public User? User { get; set; }
    public ICollection<Booking>? Bookings { get; set; }
    public ICollection<Order>? Orders { get; set; }
}
