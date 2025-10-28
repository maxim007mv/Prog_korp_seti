using Npgsql;
using System;
using System.Collections.Generic;

class Program
{
    static async Task Main(string[] args)
    {
        var connectionString = "Host=localhost;Port=5432;Database=restaurant_db;Username=postgres;Password=postgres";
        
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();
        
        Console.WriteLine("🚀 Начинаем генерацию тестовых данных...\n");
        
        // 1. Создаем пользователей
        await CreateUsers(connection);
        
        // 2. Создаем официантов
        await CreateWaiters(connection);
        
        // 3. Создаем бронирования (прошлые и будущие)
        await CreateBookings(connection);
        
        // 4. Создаем заказы на 10 миллионов рублей (250 заказов)
        await CreateOrders(connection);
        
        Console.WriteLine("\n✅ Генерация тестовых данных завершена!");
        Console.WriteLine("\n📊 Статистика:");
        await PrintStatistics(connection);
    }
    
    static async Task CreateUsers(NpgsqlConnection connection)
    {
        Console.WriteLine("👥 Создаем пользователей...");
        
        var users = new List<(string Email, string Username, string Password, string Role)>
        {
            ("admin@restaurant.com", "admin", "$2a$11$abcdefghijklmnopqrstuv", "Admin"),
            ("waiter1@restaurant.com", "waiter1", "$2a$11$abcdefghijklmnopqrstuv", "Waiter"),
            ("waiter2@restaurant.com", "waiter2", "$2a$11$abcdefghijklmnopqrstuv", "Waiter"),
            ("waiter3@restaurant.com", "waiter3", "$2a$11$abcdefghijklmnopqrstuv", "Waiter"),
            ("client1@restaurant.com", "client1", "$2a$11$abcdefghijklmnopqrstuv", "Client"),
            ("client2@restaurant.com", "client2", "$2a$11$abcdefghijklmnopqrstuv", "Client")
        };
        
        foreach (var user in users)
        {
            var sql = @"
                INSERT INTO users (email, username, password_hash, role, created_at)
                VALUES (@email, @username, @password, @role, NOW())
                ON CONFLICT (username) DO NOTHING";
                
            await using var cmd = new NpgsqlCommand(sql, connection);
            cmd.Parameters.AddWithValue("email", user.Email);
            cmd.Parameters.AddWithValue("username", user.Username);
            cmd.Parameters.AddWithValue("password", user.Password);
            cmd.Parameters.AddWithValue("role", user.Role);
            await cmd.ExecuteNonQueryAsync();
        }
        
        Console.WriteLine("   ✓ Создано 6 пользователей");
    }
    
    static async Task CreateWaiters(NpgsqlConnection connection)
    {
        Console.WriteLine("🍽️  Создаем официантов...");
        
        var waiterUserIds = new List<int>();
        var sql = "SELECT user_id FROM users WHERE role = 'Waiter'";
        await using var cmd = new NpgsqlCommand(sql, connection);
        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            waiterUserIds.Add(reader.GetInt32(0));
        }
        await reader.CloseAsync();
        
        var waiterNames = new[] 
        { 
            ("Иван", "Петров"), 
            ("Мария", "Сидорова"), 
            ("Алексей", "Смирнов") 
        };
        
        for (int i = 0; i < waiterUserIds.Count && i < waiterNames.Length; i++)
        {
            var insertSql = @"
                INSERT INTO waiters (user_id, first_name, last_name, phone, hire_date, is_active)
                VALUES (@userId, @firstName, @lastName, @phone, @hireDate, true)
                ON CONFLICT (user_id) DO NOTHING";
                
            await using var insertCmd = new NpgsqlCommand(insertSql, connection);
            insertCmd.Parameters.AddWithValue("userId", waiterUserIds[i]);
            insertCmd.Parameters.AddWithValue("firstName", waiterNames[i].Item1);
            insertCmd.Parameters.AddWithValue("lastName", waiterNames[i].Item2);
            insertCmd.Parameters.AddWithValue("phone", $"+7916123456{i}");
            insertCmd.Parameters.AddWithValue("hireDate", DateTime.Now.AddMonths(-Random.Shared.Next(1, 12)));
            await insertCmd.ExecuteNonQueryAsync();
        }
        
        Console.WriteLine($"   ✓ Создано {waiterUserIds.Count} официантов");
    }
    
    static async Task CreateBookings(NpgsqlConnection connection)
    {
        Console.WriteLine("📅 Создаем бронирования...");
        
        var names = new[] { "Иван Петров", "Мария Сидорова", "Алексей Смирнов", "Анна Иванова", 
                           "Дмитрий Козлов", "Елена Волкова", "Сергей Морозов", "Ольга Новикова",
                           "Николай Федоров", "Татьяна Соколова" };
        var phones = new[] { "+79161234567", "+79162345678", "+79163456789", "+79164567890",
                            "+79165678901", "+79166789012", "+79167890123", "+79168901234",
                            "+79169012345", "+79160123456" };
        
        var bookingCount = 0;
        
        // Прошлые бронирования (последние 30 дней)
        for (int i = 0; i < 1500; i++)
        {
            var daysAgo = Random.Shared.Next(1, 30);
            var startTime = DateTime.Now.AddDays(-daysAgo).AddHours(Random.Shared.Next(10, 20));
            var endTime = startTime.AddHours(Random.Shared.Next(1, 3));
            var tableId = Random.Shared.Next(1, 7); // У нас только 6 столов (1-6)
            var guestCount = Random.Shared.Next(2, 6);
            var nameIdx = Random.Shared.Next(names.Length);
            
            var sql = @"
                INSERT INTO bookings (table_id, client_name, client_phone, start_time, end_time, guest_count, status, created_at)
                VALUES (@tableId, @clientName, @clientPhone, @startTime, @endTime, @guestCount, 'Completed', @createdAt)";
                
            await using var cmd = new NpgsqlCommand(sql, connection);
            cmd.Parameters.AddWithValue("tableId", tableId);
            cmd.Parameters.AddWithValue("clientName", names[nameIdx]);
            cmd.Parameters.AddWithValue("clientPhone", phones[nameIdx]);
            cmd.Parameters.AddWithValue("startTime", startTime);
            cmd.Parameters.AddWithValue("endTime", endTime);
            cmd.Parameters.AddWithValue("guestCount", guestCount);
            cmd.Parameters.AddWithValue("createdAt", startTime.AddDays(-1));
            await cmd.ExecuteNonQueryAsync();
            bookingCount++;
        }
        
        // Будущие бронирования (следующие 14 дней)
        for (int i = 0; i < 500; i++)
        {
            var daysAhead = Random.Shared.Next(0, 14);
            var startTime = DateTime.Now.AddDays(daysAhead).AddHours(Random.Shared.Next(10, 20));
            var endTime = startTime.AddHours(Random.Shared.Next(1, 3));
            var tableId = Random.Shared.Next(1, 7); // У нас только 6 столов (1-6)
            var guestCount = Random.Shared.Next(2, 6);
            var nameIdx = Random.Shared.Next(names.Length);
            
            var statuses = new[] { "Confirmed", "Pending" };
            var status = statuses[Random.Shared.Next(statuses.Length)];
            
            var sql = @"
                INSERT INTO bookings (table_id, client_name, client_phone, start_time, end_time, guest_count, status, created_at)
                VALUES (@tableId, @clientName, @clientPhone, @startTime, @endTime, @guestCount, @status, NOW())";
                
            await using var cmd = new NpgsqlCommand(sql, connection);
            cmd.Parameters.AddWithValue("tableId", tableId);
            cmd.Parameters.AddWithValue("clientName", names[nameIdx]);
            cmd.Parameters.AddWithValue("clientPhone", phones[nameIdx]);
            cmd.Parameters.AddWithValue("startTime", startTime);
            cmd.Parameters.AddWithValue("endTime", endTime);
            cmd.Parameters.AddWithValue("guestCount", guestCount);
            cmd.Parameters.AddWithValue("status", status);
            await cmd.ExecuteNonQueryAsync();
            bookingCount++;
        }
        
        Console.WriteLine($"   ✓ Создано {bookingCount} бронирований (1500 завершенных, 500 будущих)");
    }
    
    static async Task CreateOrders(NpgsqlConnection connection)
    {
        Console.WriteLine("🧾 Создаем заказы на 10 миллионов рублей...");
        
        // Получаем ID официантов
        var waiterIds = new List<int>();
        var waiterSql = "SELECT waiter_id FROM waiters";
        await using (var cmd = new NpgsqlCommand(waiterSql, connection))
        {
            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                waiterIds.Add(reader.GetInt32(0));
            }
        }
        
        // Получаем ID блюд
        var dishIds = new List<(int Id, decimal Price)>();
        var dishSql = "SELECT dish_id, price FROM dishes";
        await using (var cmd = new NpgsqlCommand(dishSql, connection))
        {
            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                dishIds.Add((reader.GetInt32(0), reader.GetDecimal(1)));
            }
        }
        
        var totalOrders = 250;
        var targetRevenue = 10_000_000m; // 10 миллионов рублей
        var avgOrderAmount = targetRevenue / totalOrders; // ~40,000 рублей на заказ
        
        var orderCount = 0;
        var totalRevenue = 0m;
        
        // Создаем заказы распределенные на последние 90 дней для аналитики
        for (int i = 0; i < totalOrders; i++)
        {
            var daysAgo = Random.Shared.Next(0, 90);
            var orderTime = DateTime.Now.AddDays(-daysAgo).AddHours(Random.Shared.Next(10, 22));
            var tableId = Random.Shared.Next(1, 7);
            var waiterId = waiterIds[Random.Shared.Next(waiterIds.Count)];
            
            // 95% заказов завершены, 5% отменены
            var status = Random.Shared.Next(100) < 95 ? "Completed" : "Cancelled";
            
            // Создаем заказ
            var orderSql = @"
                INSERT INTO orders (table_id, waiter_id, status, total_price, start_time, end_time, created_at, updated_at)
                VALUES (@tableId, @waiterId, @status, 0, @startTime, @endTime, @createdAt, @updatedAt)
                RETURNING order_id";
                
            int orderId;
            await using (var cmd = new NpgsqlCommand(orderSql, connection))
            {
                cmd.Parameters.AddWithValue("tableId", tableId);
                cmd.Parameters.AddWithValue("waiterId", waiterId);
                cmd.Parameters.AddWithValue("status", status);
                cmd.Parameters.AddWithValue("startTime", orderTime);
                cmd.Parameters.AddWithValue("endTime", orderTime.AddMinutes(90));
                cmd.Parameters.AddWithValue("createdAt", orderTime);
                cmd.Parameters.AddWithValue("updatedAt", orderTime.AddMinutes(60));
                orderId = (int)(await cmd.ExecuteScalarAsync() ?? 0);
            }
            
            // Рассчитываем целевую сумму заказа с небольшим разбросом (±20%)
            var targetAmount = avgOrderAmount * (decimal)(0.8 + Random.Shared.NextDouble() * 0.4);
            
            // Добавляем позиции в заказ до достижения целевой суммы
            var orderTotal = 0m;
            var itemCount = Random.Shared.Next(3, 10); // От 3 до 9 позиций
            
            for (int j = 0; j < itemCount; j++)
            {
                var dish = dishIds[Random.Shared.Next(dishIds.Count)];
                
                // Рассчитываем количество чтобы приблизиться к целевой сумме
                var remainingAmount = targetAmount - orderTotal;
                var maxQuantity = Math.Max(1, (int)(remainingAmount / dish.Price));
                var quantity = Random.Shared.Next(1, Math.Min(maxQuantity, 20) + 1);
                
                var itemTotal = dish.Price * quantity;
                
                var itemSql = @"
                    INSERT INTO order_items (order_id, dish_id, quantity, price, status)
                    VALUES (@orderId, @dishId, @quantity, @price, 'delivered')";
                    
                await using var itemCmd = new NpgsqlCommand(itemSql, connection);
                itemCmd.Parameters.AddWithValue("orderId", orderId);
                itemCmd.Parameters.AddWithValue("dishId", dish.Id);
                itemCmd.Parameters.AddWithValue("quantity", quantity);
                itemCmd.Parameters.AddWithValue("price", dish.Price);
                await itemCmd.ExecuteNonQueryAsync();
                
                orderTotal += itemTotal;
                
                // Если приблизились к целевой сумме, останавливаемся
                if (orderTotal >= targetAmount * 0.9m)
                    break;
            }
            
            // Обновляем общую сумму заказа
            var updateSql = "UPDATE orders SET total_price = @total WHERE order_id = @id";
            await using (var updateCmd = new NpgsqlCommand(updateSql, connection))
            {
                updateCmd.Parameters.AddWithValue("total", orderTotal);
                updateCmd.Parameters.AddWithValue("id", orderId);
                await updateCmd.ExecuteNonQueryAsync();
            }
            
            if (status == "Completed")
            {
                totalRevenue += orderTotal;
            }
            
            orderCount++;
            
            // Прогресс
            if (orderCount % 50 == 0)
            {
                Console.WriteLine($"   📊 Создано {orderCount}/{totalOrders} заказов, выручка: {totalRevenue:N0} ₽");
            }
        }
        
        Console.WriteLine($"   ✅ Создано {orderCount} заказов");
        Console.WriteLine($"   💰 Общая выручка: {totalRevenue:N2} ₽");
        Console.WriteLine($"   📈 Средний чек: {(totalRevenue / orderCount):N2} ₽");
    }
    
    static async Task PrintStatistics(NpgsqlConnection connection)
    {
        // Бронирования
        var bookingSql = @"
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'Completed') as completed,
                COUNT(*) FILTER (WHERE status = 'Confirmed') as confirmed,
                COUNT(*) FILTER (WHERE status = 'Pending') as pending
            FROM bookings";
            
        await using (var cmd = new NpgsqlCommand(bookingSql, connection))
        {
            await using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                Console.WriteLine($"\n📅 Бронирования:");
                Console.WriteLine($"   Всего: {reader.GetInt32(0)}");
                Console.WriteLine($"   Завершено: {reader.GetInt32(1)}");
                Console.WriteLine($"   Подтверждено: {reader.GetInt32(2)}");
                Console.WriteLine($"   Ожидает: {reader.GetInt32(3)}");
            }
        }
        
        // Заказы
        var orderSql = @"
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'Completed') as completed,
                SUM(total_price) FILTER (WHERE status = 'Completed') as revenue,
                AVG(total_price) FILTER (WHERE status = 'Completed') as avg_check
            FROM orders";
            
        await using (var cmd = new NpgsqlCommand(orderSql, connection))
        {
            await using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                Console.WriteLine($"\n🧾 Заказы:");
                Console.WriteLine($"   Всего: {reader.GetInt32(0)}");
                Console.WriteLine($"   Завершено: {reader.GetInt32(1)}");
                Console.WriteLine($"   Выручка: {reader.GetDecimal(2):N2} ₽");
                Console.WriteLine($"   Средний чек: {reader.GetDecimal(3):N2} ₽");
            }
        }
        
        // Официанты
        var waiterSql = "SELECT COUNT(*) FROM waiters";
        await using (var cmd = new NpgsqlCommand(waiterSql, connection))
        {
            var count = (long)(await cmd.ExecuteScalarAsync() ?? 0);
            Console.WriteLine($"\n🍽️  Официантов: {count}");
        }
        
        // Блюда
        var dishSql = "SELECT COUNT(*) FROM dishes";
        await using (var cmd = new NpgsqlCommand(dishSql, connection))
        {
            var count = (long)(await cmd.ExecuteScalarAsync() ?? 0);
            Console.WriteLine($"🍽️  Блюд в меню: {count}");
        }
        
        Console.WriteLine("\n🎯 Система готова к тестированию!");
        Console.WriteLine("\n📍 Доступ:");
        Console.WriteLine("   Frontend: http://localhost:3000");
        Console.WriteLine("   Backend API: http://localhost:3001/api");
        Console.WriteLine("   Swagger: http://localhost:3001/swagger");
        Console.WriteLine("\n🔐 Тестовые аккаунты:");
        Console.WriteLine("   Admin: admin@restaurant.com / admin123");
        Console.WriteLine("   Waiter: waiter1@restaurant.com / waiter123");
        Console.WriteLine("   Client: client1@restaurant.com / client123");
    }
}
