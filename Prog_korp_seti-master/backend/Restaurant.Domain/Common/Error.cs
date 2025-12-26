namespace Restaurant.Domain.Common;

/// <summary>
/// Represents an error with code and message
/// </summary>
public sealed record Error(string Code, string Message)
{
    public static readonly Error None = new(string.Empty, string.Empty);
    public static readonly Error NullValue = new("Error.NullValue", "Null value was provided");

    public static implicit operator string(Error error) => error.Code;
}

/// <summary>
/// Common domain errors
/// </summary>
public static class DomainErrors
{
    public static class Order
    {
        public static Error NotFound(int orderId) => 
            new("Order.NotFound", $"Order with ID {orderId} was not found");
        
        public static Error InvalidStatus(string status) => 
            new("Order.InvalidStatus", $"Invalid order status: {status}");
        
        public static Error EmptyItems => 
            new("Order.EmptyItems", "Order must have at least one item");
        
        public static Error NegativeTotal => 
            new("Order.NegativeTotal", "Order total cannot be negative");
    }

    public static class Booking
    {
        public static Error NotFound(int bookingId) => 
            new("Booking.NotFound", $"Booking with ID {bookingId} was not found");
        
        public static Error TableNotAvailable => 
            new("Booking.TableNotAvailable", "Table is not available for the selected time");
        
        public static Error InvalidTimeRange => 
            new("Booking.InvalidTimeRange", "End time must be after start time");
        
        public static Error PastDate => 
            new("Booking.PastDate", "Cannot create booking in the past");
        
        public static Error InvalidPhoneNumber => 
            new("Booking.InvalidPhoneNumber", "Phone number format is invalid");
    }

    public static class Table
    {
        public static Error NotFound(int tableId) => 
            new("Table.NotFound", $"Table with ID {tableId} was not found");
        
        public static Error NotActive => 
            new("Table.NotActive", "Table is not active");
        
        public static Error InsufficientCapacity(int requested, int available) => 
            new("Table.InsufficientCapacity", 
                $"Table capacity ({available}) is insufficient for {requested} guests");
    }

    public static class Dish
    {
        public static Error NotFound(int dishId) => 
            new("Dish.NotFound", $"Dish with ID {dishId} was not found");
        
        public static Error NotAvailable => 
            new("Dish.NotAvailable", "Dish is not available");
        
        public static Error InvalidPrice => 
            new("Dish.InvalidPrice", "Dish price must be greater than zero");
    }

    public static class User
    {
        public static Error NotFound(int userId) => 
            new("User.NotFound", $"User with ID {userId} was not found");
        
        public static Error UsernameAlreadyExists => 
            new("User.UsernameExists", "Username is already taken");
        
        public static Error EmailAlreadyExists => 
            new("User.EmailExists", "Email is already registered");
        
        public static Error InvalidCredentials => 
            new("User.InvalidCredentials", "Username or password is incorrect");
        
        public static Error UnauthorizedRole => 
            new("User.UnauthorizedRole", "User does not have required role");
    }

    public static class Waiter
    {
        public static Error NotFound(int waiterId) => 
            new("Waiter.NotFound", $"Waiter with ID {waiterId} was not found");
        
        public static Error NotActive => 
            new("Waiter.NotActive", "Waiter is not active");
        
        public static Error NoAvailableWaiters => 
            new("Waiter.NoAvailable", "No active waiters available");
    }
}
