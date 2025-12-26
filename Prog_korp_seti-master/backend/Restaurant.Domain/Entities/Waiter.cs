namespace Restaurant.Domain.Entities;

public class Waiter
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public DateTime? HireDate { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public User? User { get; set; }
    public ICollection<Order>? Orders { get; set; }
}
