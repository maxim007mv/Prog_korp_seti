using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Restaurant.Infrastructure.Persistence;

Console.WriteLine("=== Проверка подключения к БД restaurant_db ===\n");

var connectionString = "Host=localhost;Port=5432;Database=restaurant_db;Username=postgres;Password=postgres123";

var services = new ServiceCollection();
services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

var serviceProvider = services.BuildServiceProvider();

try
{
    using var scope = serviceProvider.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    Console.WriteLine("1. Проверка подключения к базе данных...");
    var canConnect = await context.Database.CanConnectAsync();
    
    if (canConnect)
    {
        Console.WriteLine("✓ Подключение успешно установлено!\n");
        
        Console.WriteLine("2. Проверка таблиц в базе данных...");
        
        var usersCount = await context.Users.CountAsync();
        Console.WriteLine($"   - Таблица users: {usersCount} записей");
        
        var tablesCount = await context.Tables.CountAsync();
        Console.WriteLine($"   - Таблица tables: {tablesCount} записей");
        
        var bookingsCount = await context.Bookings.CountAsync();
        Console.WriteLine($"   - Таблица bookings: {bookingsCount} записей");
        
        var dishesCount = await context.Dishes.CountAsync();
        Console.WriteLine($"   - Таблица dishes: {dishesCount} записей");
        
        var ordersCount = await context.Orders.CountAsync();
        Console.WriteLine($"   - Таблица orders: {ordersCount} записей");
        
        Console.WriteLine("\n✓ Все таблицы доступны!");
        Console.WriteLine("\n=== Результат: БД настроена корректно ===");
    }
    else
    {
        Console.WriteLine("✗ Не удалось подключиться к базе данных");
        Console.WriteLine("  Проверьте:");
        Console.WriteLine("  1. PostgreSQL запущен");
        Console.WriteLine("  2. База данных restaurant_db существует");
        Console.WriteLine("  3. Пользователь postgres имеет доступ");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"\n✗ Ошибка подключения:");
    Console.WriteLine($"  {ex.Message}");
    
    if (ex.InnerException != null)
    {
        Console.WriteLine($"\nДетали:");
        Console.WriteLine($"  {ex.InnerException.Message}");
    }
    
    Console.WriteLine("\nВозможные решения:");
    Console.WriteLine("  1. Убедитесь, что PostgreSQL запущен");
    Console.WriteLine("  2. Создайте базу данных: CREATE DATABASE restaurant_db;");
    Console.WriteLine("  3. Примените SQL скрипт: database_schema.sql");
    Console.WriteLine("  4. Проверьте пароль пользователя postgres");
}
