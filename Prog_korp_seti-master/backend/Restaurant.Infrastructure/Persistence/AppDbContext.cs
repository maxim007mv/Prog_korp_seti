using Microsoft.EntityFrameworkCore;
using Restaurant.Domain.Entities;

namespace Restaurant.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Waiter> Waiters => Set<Waiter>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Table> Tables => Set<Table>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<DishCategory> DishCategories => Set<DishCategory>();
    public DbSet<DishType> DishTypes => Set<DishType>();
    public DbSet<Dish> Dishes => Set<Dish>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Users
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("user_id");
            e.Property(x => x.Username).HasColumnName("username").HasMaxLength(100).IsRequired();
            e.Property(x => x.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
            e.Property(x => x.Email).HasColumnName("email").HasMaxLength(200);
            e.Property(x => x.Role).HasColumnName("role").HasMaxLength(20).IsRequired();
            e.Property(x => x.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            e.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            e.HasIndex(x => x.Username).IsUnique().HasDatabaseName("idx_users_username");
            e.HasIndex(x => x.Role).HasDatabaseName("idx_users_role");
            e.HasIndex(x => x.IsActive).HasDatabaseName("idx_users_active");
        });

        // Waiters
        modelBuilder.Entity<Waiter>(e =>
        {
            e.ToTable("waiters");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("waiter_id");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.FirstName).HasColumnName("first_name").HasMaxLength(100).IsRequired();
            e.Property(x => x.LastName).HasColumnName("last_name").HasMaxLength(100).IsRequired();
            e.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(20);
            e.Property(x => x.HireDate).HasColumnName("hire_date");
            e.Property(x => x.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            
            e.HasOne(x => x.User).WithOne(u => u.Waiter).HasForeignKey<Waiter>(x => x.UserId).OnDelete(DeleteBehavior.SetNull);
            e.HasIndex(x => x.UserId).IsUnique().HasDatabaseName("idx_waiters_user");
            e.HasIndex(x => x.IsActive).HasDatabaseName("idx_waiters_active");
        });

        // Clients
        modelBuilder.Entity<Client>(e =>
        {
            e.ToTable("clients");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("client_id");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.FirstName).HasColumnName("first_name").HasMaxLength(100);
            e.Property(x => x.LastName).HasColumnName("last_name").HasMaxLength(100);
            e.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(20).IsRequired();
            e.Property(x => x.Email).HasColumnName("email").HasMaxLength(200);
            e.Property(x => x.DateOfBirth).HasColumnName("date_of_birth");
            e.Property(x => x.LoyaltyPoints).HasColumnName("loyalty_points").HasDefaultValue(0);
            e.Property(x => x.RegistrationDate).HasColumnName("registration_date").HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            e.HasOne(x => x.User).WithOne(u => u.Client).HasForeignKey<Client>(x => x.UserId).OnDelete(DeleteBehavior.SetNull);
            e.HasIndex(x => x.Phone).HasDatabaseName("idx_clients_phone");
            e.HasIndex(x => x.Email).HasDatabaseName("idx_clients_email");
            e.HasIndex(x => x.UserId).IsUnique().HasDatabaseName("idx_clients_user");
        });

        // Tables
        modelBuilder.Entity<Table>(e =>
        {
            e.ToTable("tables");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("table_id");
            e.Property(x => x.Location).HasColumnName("location").HasMaxLength(100).IsRequired();
            e.Property(x => x.Seats).HasColumnName("seats").IsRequired();
            e.Property(x => x.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            e.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            e.HasIndex(x => x.Location).HasDatabaseName("idx_tables_location");
            e.HasIndex(x => x.Seats).HasDatabaseName("idx_tables_seats");
            e.HasIndex(x => x.IsActive).HasDatabaseName("idx_tables_active");
        });

        // Bookings
        modelBuilder.Entity<Booking>(e =>
        {
            e.ToTable("bookings");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("booking_id");
            e.Property(x => x.TableId).HasColumnName("table_id");
            e.Property(x => x.ClientId).HasColumnName("client_id");
            e.Property(x => x.ClientName).HasColumnName("client_name").HasMaxLength(100).IsRequired();
            e.Property(x => x.ClientPhone).HasColumnName("client_phone").HasMaxLength(20).IsRequired();
            e.Property(x => x.StartTime).HasColumnName("start_time");
            e.Property(x => x.EndTime).HasColumnName("end_time");
            e.Property(x => x.Comment).HasColumnName("comment");
            e.Property(x => x.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("активно");
            e.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            e.HasOne(x => x.Table).WithMany(t => t.Bookings).HasForeignKey(x => x.TableId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Client).WithMany(c => c.Bookings).HasForeignKey(x => x.ClientId).OnDelete(DeleteBehavior.SetNull);
            
            e.HasIndex(x => x.TableId).HasDatabaseName("idx_bookings_table");
            e.HasIndex(x => x.ClientId).HasDatabaseName("idx_bookings_client");
            e.HasIndex(x => x.ClientPhone).HasDatabaseName("idx_bookings_phone");
            e.HasIndex(x => x.ClientName).HasDatabaseName("idx_bookings_name");
            e.HasIndex(x => new { x.StartTime, x.EndTime }).HasDatabaseName("idx_bookings_time_range");
            e.HasIndex(x => x.Status).HasDatabaseName("idx_bookings_status");
        });

        // DishCategories
        modelBuilder.Entity<DishCategory>(e =>
        {
            e.ToTable("dish_categories");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("category_id");
            e.Property(x => x.CategoryName).HasColumnName("category_name").HasMaxLength(100).IsRequired();
            e.Property(x => x.DisplayOrder).HasColumnName("display_order").HasDefaultValue(0);
            
            e.HasIndex(x => x.CategoryName).IsUnique();
            e.HasIndex(x => x.DisplayOrder).HasDatabaseName("idx_dish_categories_order");
        });

        // DishTypes
        modelBuilder.Entity<DishType>(e =>
        {
            e.ToTable("dish_types");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("type_id");
            e.Property(x => x.TypeName).HasColumnName("type_name").HasMaxLength(50).IsRequired();
            
            e.HasIndex(x => x.TypeName).IsUnique();
        });

        // Dishes
        modelBuilder.Entity<Dish>(e =>
        {
            e.ToTable("dishes");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("dish_id");
            e.Property(x => x.Name).HasColumnName("dish_name").HasMaxLength(200).IsRequired();
            e.Property(x => x.Composition).HasColumnName("composition");
            e.Property(x => x.Weight).HasColumnName("weight").HasMaxLength(50);
            e.Property(x => x.Price).HasColumnName("price").HasPrecision(10, 2);
            e.Property(x => x.CategoryId).HasColumnName("category_id");
            e.Property(x => x.CookingTime).HasColumnName("cooking_time");
            e.Property(x => x.IsAvailable).HasColumnName("is_available").HasDefaultValue(true);
            e.Property(x => x.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
            e.Property(x => x.ImageUrl).HasColumnName("image_url").HasMaxLength(500);
            e.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            e.HasOne(x => x.Category).WithMany(c => c.Dishes).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(x => x.Types).WithMany(t => t.Dishes).UsingEntity<Dictionary<string, object>>(
                "dish_type_links",
                j => j.HasOne<DishType>().WithMany().HasForeignKey("type_id").OnDelete(DeleteBehavior.Cascade),
                j => j.HasOne<Dish>().WithMany().HasForeignKey("dish_id").OnDelete(DeleteBehavior.Cascade)
            );
            
            e.HasIndex(x => x.CategoryId).HasDatabaseName("idx_dishes_category");
            e.HasIndex(x => x.IsAvailable).HasDatabaseName("idx_dishes_available");
            e.HasIndex(x => x.IsDeleted).HasDatabaseName("idx_dishes_deleted");
            e.HasIndex(x => x.Price).HasDatabaseName("idx_dishes_price");
        });

        // Orders
        modelBuilder.Entity<Order>(e =>
        {
            e.ToTable("orders");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("order_id");
            e.Property(x => x.TableId).HasColumnName("table_id");
            e.Property(x => x.WaiterId).HasColumnName("waiter_id");
            e.Property(x => x.BookingId).HasColumnName("booking_id");
            e.Property(x => x.StartTime).HasColumnName("start_time").HasDefaultValueSql("CURRENT_TIMESTAMP");
            e.Property(x => x.EndTime).HasColumnName("end_time");
            e.Property(x => x.Comment).HasColumnName("comment");
            e.Property(x => x.TotalPrice).HasColumnName("total_price").HasPrecision(10, 2).HasDefaultValue(0);
            e.Property(x => x.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("активен");
            e.Property(x => x.IsWalkIn).HasColumnName("is_walk_in").HasDefaultValue(false);
            e.Property(x => x.ShiftDate).HasColumnName("shift_date").HasDefaultValueSql("CURRENT_DATE");
            e.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            e.HasOne(x => x.Table).WithMany(t => t.Orders).HasForeignKey(x => x.TableId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Waiter).WithMany(w => w.Orders).HasForeignKey(x => x.WaiterId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Booking).WithMany(b => b.Orders).HasForeignKey(x => x.BookingId).OnDelete(DeleteBehavior.SetNull);
            
            e.HasIndex(x => x.TableId).HasDatabaseName("idx_orders_table");
            e.HasIndex(x => x.WaiterId).HasDatabaseName("idx_orders_waiter");
            e.HasIndex(x => x.BookingId).HasDatabaseName("idx_orders_booking");
            e.HasIndex(x => x.Status).HasDatabaseName("idx_orders_status");
            e.HasIndex(x => x.StartTime).HasDatabaseName("idx_orders_start_time");
            e.HasIndex(x => x.EndTime).HasDatabaseName("idx_orders_end_time");
            e.HasIndex(x => x.ShiftDate).HasDatabaseName("idx_orders_shift_date");
        });

        // OrderItems
        modelBuilder.Entity<OrderItem>(e =>
        {
            e.ToTable("order_items");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("order_item_id");
            e.Property(x => x.OrderId).HasColumnName("order_id");
            e.Property(x => x.DishId).HasColumnName("dish_id");
            e.Property(x => x.Quantity).HasColumnName("quantity").HasDefaultValue(1);
            e.Property(x => x.Price).HasColumnName("price").HasPrecision(10, 2);
            e.Property(x => x.Comment).HasColumnName("comment");
            e.Property(x => x.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("заказано");
            
            e.HasOne(x => x.Order).WithMany(o => o.Items).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Dish).WithMany(d => d.OrderItems).HasForeignKey(x => x.DishId).OnDelete(DeleteBehavior.Restrict);
            
            e.HasIndex(x => x.OrderId).HasDatabaseName("idx_order_items_order");
            e.HasIndex(x => x.DishId).HasDatabaseName("idx_order_items_dish");
            e.HasIndex(x => x.Status).HasDatabaseName("idx_order_items_status");
        });
    }
}

