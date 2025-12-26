# Технический отчет: Реализация каскадных связей Client-Order-Booking с транзакциями

**Дата реализации:** 24 января 2025  
**Стек:** ASP.NET Core 8.0 + EF Core + PostgreSQL  
**Архитектура:** Clean Architecture с транзакциями и аудитом

---

## 📋 Краткое резюме

Реализована полная система управления клиентами, заказами и бронированиями с:
- ✅ Каскадным удалением через FK constraints
- ✅ Атомарными транзакциями для всех операций
- ✅ Полным аудитом в таблице `admin_logs`
- ✅ Автоматическим удалением клиента при удалении последнего заказа
- ✅ API endpoints с обработкой ошибок и rollback

---

## 1️⃣ Структура базы данных с каскадными связями

### Схема связей

```
┌──────────┐
│ clients  │
│ (PK: id) │
└────┬─────┘
     │
     │ ON DELETE CASCADE
     ▼
┌──────────┐         ┌───────────┐
│ orders   │◄────────│ bookings  │
│ (FK: id) │ SET NULL│ (FK: id)  │
└────┬─────┘         └───────────┘
     │
     │ ON DELETE CASCADE
     ▼
┌──────────────┐
│ order_items  │
└──────────────┘
```

### SQL DDL (Полная миграция 003)

```sql
-- 1. Создание таблицы логов
CREATE TABLE admin_logs (
    log_id SERIAL PRIMARY KEY,
    admin_id INTEGER,
    admin_username VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    entity_data JSONB, -- Snapshot данных до операции
    comment TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_admin_logs_admin FOREIGN KEY (admin_id) 
        REFERENCES users(user_id) ON DELETE SET NULL
);

-- Индексы для быстрого поиска
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_entity_type ON admin_logs(entity_type);
CREATE INDEX idx_admin_logs_timestamp ON admin_logs(timestamp DESC);
CREATE INDEX idx_admin_logs_type_action_time ON admin_logs(entity_type, action, timestamp DESC);

-- 2. Добавление client_id в orders
ALTER TABLE orders ADD COLUMN client_id INTEGER;
CREATE INDEX idx_orders_client ON orders(client_id);

-- 3. Каскадное удаление: Client → Orders
ALTER TABLE orders
ADD CONSTRAINT fk_orders_client FOREIGN KEY (client_id)
    REFERENCES clients(client_id) ON DELETE CASCADE;

-- 4. Триггер для автоудаления клиента без заказов
CREATE OR REPLACE FUNCTION check_client_orders_after_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.client_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM orders 
            WHERE client_id = OLD.client_id 
            AND order_id != OLD.order_id
        ) THEN
            DELETE FROM clients WHERE client_id = OLD.client_id;
        END IF;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_client_orders_after_delete
AFTER DELETE ON orders
FOR EACH ROW
EXECUTE FUNCTION check_client_orders_after_delete();

-- 5. Триггер логирования удалений
CREATE OR REPLACE FUNCTION log_entity_deletion()
RETURNS TRIGGER AS $$
DECLARE
    admin_user VARCHAR(100);
BEGIN
    admin_user := current_user;
    
    INSERT INTO admin_logs (
        admin_username, action, entity_type, entity_id, entity_data, comment
    ) VALUES (
        admin_user,
        'DELETE',
        TG_TABLE_NAME,
        CASE TG_TABLE_NAME
            WHEN 'orders' THEN OLD.order_id
            WHEN 'bookings' THEN OLD.booking_id
            WHEN 'clients' THEN OLD.client_id
        END,
        row_to_json(OLD),
        'Automatic deletion via trigger'
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_order_deletion BEFORE DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION log_entity_deletion();

CREATE TRIGGER trg_log_booking_deletion BEFORE DELETE ON bookings
FOR EACH ROW EXECUTE FUNCTION log_entity_deletion();

CREATE TRIGGER trg_log_client_deletion BEFORE DELETE ON clients
FOR EACH ROW EXECUTE FUNCTION log_entity_deletion();
```

---

## 2️⃣ Код API Endpoints

### ClientsController.cs

#### POST /api/clients - Создание клиента с первым заказом

**Транзакция:**
1. Проверка существующего клиента по телефону
2. Создание нового клиента (если не существует)
3. Создание заказа с привязкой к клиенту
4. Добавление позиций в заказ
5. Расчет итоговой суммы
6. Логирование в `admin_logs`
7. Commit или Rollback

**Код:**
```csharp
[HttpPost]
public async Task<ActionResult<ClientWithOrderResponseDto>> CreateClientWithOrder(
    [FromBody] CreateClientWithOrderDto dto)
{
    using var transaction = await _context.Database.BeginTransactionAsync();
    
    try
    {
        // 1. Проверка/создание клиента
        var client = await _context.Clients
            .FirstOrDefaultAsync(c => c.Phone == dto.Phone);
        
        if (client == null)
        {
            client = new Client { /* ... */ };
            _context.Clients.Add(client);
            await _context.SaveChangesAsync();
        }

        // 2. Создание заказа с привязкой к клиенту
        var order = new Order
        {
            ClientId = client.Id, // ← Важная связь!
            TableId = dto.TableId,
            WaiterId = dto.WaiterId,
            BookingId = dto.BookingId
        };
        
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // 3. Добавление позиций и расчет суммы
        decimal totalPrice = 0;
        foreach (var item in dto.Items)
        {
            var dish = await _context.Dishes.FindAsync(item.DishId);
            var orderItem = new OrderItem { /* ... */ };
            _context.OrderItems.Add(orderItem);
            totalPrice += dish.Price * item.Quantity;
        }
        
        order.TotalPrice = totalPrice;

        // 4. Логирование
        var adminLog = new AdminLog
        {
            Action = "CREATE",
            EntityType = "ClientOrder",
            EntityData = JsonSerializer.Serialize(new { client, order })
        };
        _context.AdminLogs.Add(adminLog);

        await _context.SaveChangesAsync();
        await transaction.CommitAsync(); // ← Все или ничего!

        return Ok(new ClientWithOrderResponseDto { /* ... */ });
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync(); // ← Откат при ошибке
        _logger.LogError(ex, "Transaction rolled back");
        return StatusCode(500, new { error = ex.Message });
    }
}
```

#### DELETE /api/clients/{id} - Каскадное удаление

**Поведение:**
- Удаляет клиента
- Автоматически удаляет все его заказы (через FK `ON DELETE CASCADE`)
- Логирует операцию с snapshot данных

**Важно:** OrderItems удаляются автоматически через `orders → order_items CASCADE`

---

### OrdersController.cs

#### DELETE /api/orders/{id} - Удаление заказа

**Логика:**
1. Получение заказа с данными клиента
2. Подсчет других заказов клиента
3. Логирование удаления заказа
4. Удаление заказа
5. **Если это последний заказ клиента** → удаление клиента
6. Логирование удаления клиента (если был удален)

**Код:**
```csharp
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteOrder(int id, [FromQuery] int? adminId = null)
{
    using var transaction = await _context.Database.BeginTransactionAsync();

    try
    {
        var order = await _context.Orders
            .Include(o => o.Client)
            .FirstOrDefaultAsync(o => o.Id == id);

        // Проверка: остались ли другие заказы у клиента?
        bool shouldDeleteClient = false;
        if (order.ClientId.HasValue)
        {
            var clientOrdersCount = await _context.Orders
                .CountAsync(o => o.ClientId == order.ClientId && o.Id != id);
            
            shouldDeleteClient = (clientOrdersCount == 0);
        }

        // Логируем удаление заказа
        var adminLog = new AdminLog { /* ... */ };
        _context.AdminLogs.Add(adminLog);

        // Удаляем заказ
        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();

        // Удаляем клиента, если это последний заказ
        if (shouldDeleteClient && order.ClientId.HasValue)
        {
            var client = await _context.Clients.FindAsync(order.ClientId.Value);
            if (client != null)
            {
                var clientLog = new AdminLog { /* ... */ };
                _context.AdminLogs.Add(clientLog);
                _context.Clients.Remove(client);
                await _context.SaveChangesAsync();
            }
        }

        await transaction.CommitAsync();
        return Ok(new { deletedOrderId = id, deletedClientId = order.ClientId });
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        return StatusCode(500, new { error = ex.Message });
    }
}
```

---

### BookingController.cs

#### DELETE /api/bookings/{id} - Удаление бронирования

**Логика:**
1. Получение бронирования с заказами
2. Логирование удаления брони
3. Удаление всех связанных заказов (с логированием каждого)
4. Удаление бронирования
5. Commit транзакции

**Важно:** Связь `Booking → Order` имеет `ON DELETE SET NULL`, поэтому заказы **НЕ удаляются автоматически**. Мы удаляем их вручную для контроля.

---

## 3️⃣ Как работает каскадное удаление

### Сценарий 1: Удаление клиента

```
Admin вызывает DELETE /api/clients/123

1️⃣ Транзакция начинается
2️⃣ Логируется удаление клиента (snapshot в admin_logs)
3️⃣ EF Core выполняет DELETE FROM clients WHERE client_id = 123
4️⃣ PostgreSQL автоматически удаляет все orders WHERE client_id = 123
   (благодаря ON DELETE CASCADE на FK)
5️⃣ PostgreSQL автоматически удаляет все order_items для этих orders
   (благодаря ON DELETE CASCADE на FK orders → order_items)
6️⃣ Триггер trg_log_order_deletion логирует каждое удаление
7️⃣ COMMIT → все изменения применяются атомарно
```

**Результат:** Удален 1 клиент, 5 заказов, 23 позиции. Все залогировано.

---

### Сценарий 2: Удаление заказа (последний у клиента)

```
Admin вызывает DELETE /api/orders/456

1️⃣ Транзакция начинается
2️⃣ Проверка: SELECT COUNT(*) FROM orders WHERE client_id = X AND order_id != 456
   Результат: 0 (это последний заказ)
3️⃣ Логируется удаление заказа
4️⃣ DELETE FROM orders WHERE order_id = 456
5️⃣ OrderItems удаляются автоматически (CASCADE)
6️⃣ Триггер обнаруживает, что у клиента больше нет заказов
7️⃣ Логируется удаление клиента
8️⃣ DELETE FROM clients WHERE client_id = X
9️⃣ COMMIT
```

**Результат:** Удален 1 заказ, 3 позиции, 1 клиент. Операция атомарна.

---

### Сценарий 3: Удаление бронирования

```
Admin вызывает DELETE /api/bookings/789

1️⃣ Транзакция начинается
2️⃣ Получение брони с Include(b => b.Orders)
3️⃣ Логируется удаление брони
4️⃣ Для каждого заказа в Orders:
   - Логируется удаление
   - DELETE FROM orders WHERE order_id = ...
5️⃣ DELETE FROM bookings WHERE booking_id = 789
6️⃣ COMMIT

Клиенты НЕ удаляются (у них могут быть другие заказы)
```

---

## 4️⃣ Защита транзакций

### Механизмы защиты:

1. **BEGIN TRANSACTION / COMMIT / ROLLBACK**
   - Все операции выполняются в транзакции
   - Ошибка на любом этапе → полный откат
   - Нет "частичных" удалений

2. **Try-Catch обработка**
   ```csharp
   try {
       await transaction.CommitAsync();
   } catch (Exception ex) {
       await transaction.RollbackAsync();
       _logger.LogError(ex, "Transaction failed");
   }
   ```

3. **Foreign Key Constraints**
   - Невозможно удалить стол, если есть активные заказы (RESTRICT)
   - Невозможно создать заказ с несуществующим dish_id (RESTRICT)

4. **Проверки на уровне API**
   - Валидация входных данных
   - Проверка существования сущностей
   - Возврат 404/400/500 с детальными ошибками

5. **Логирование всех операций**
   - Каждое CREATE/UPDATE/DELETE → запись в `admin_logs`
   - JSON snapshot данных до удаления
   - Timestamp, admin_id, comment

---

## 5️⃣ Применение миграции

### Шаг 1: Выполнить SQL скрипт

```bash
# Подключение к PostgreSQL
psql -h localhost -U postgres -d restaurant_db

# Выполнение миграции
\i backend/migrations/003_client_orders_cascade.sql
```

### Шаг 2: Применить EF Core миграцию (опционально)

```bash
cd backend/Restaurant.Infrastructure
dotnet ef migrations add AddClientOrdersCascade
dotnet ef database update
```

### Шаг 3: Перезапустить backend

```bash
cd backend/Restaurant.Api
dotnet build
dotnet run
```

---

## 6️⃣ Тестирование

### Тест 1: Создание клиента с заказом

```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Иван",
    "lastName": "Петров",
    "phone": "+79991234567",
    "email": "ivan@example.com",
    "tableId": 1,
    "waiterId": 1,
    "items": [
      {"dishId": 1, "quantity": 2},
      {"dishId": 5, "quantity": 1}
    ]
  }'
```

**Ожидаемый результат:**
```json
{
  "clientId": 123,
  "clientName": "Иван Петров",
  "phone": "+79991234567",
  "orderId": 456,
  "totalPrice": 1250.00,
  "createdAt": "2025-01-24T18:42:00Z"
}
```

**Проверка в БД:**
```sql
SELECT * FROM clients WHERE phone = '+79991234567';
SELECT * FROM orders WHERE client_id = 123;
SELECT * FROM order_items WHERE order_id = 456;
SELECT * FROM admin_logs WHERE entity_type = 'ClientOrder' AND action = 'CREATE';
```

---

### Тест 2: Удаление заказа (с автоудалением клиента)

```bash
curl -X DELETE "http://localhost:3001/api/orders/456?adminId=1&comment=Тестовое удаление"
```

**Ожидаемый результат:**
```json
{
  "message": "Заказ удален. Клиент ID: 123 также удален (последний заказ)",
  "deletedOrderId": 456,
  "deletedClientId": 123
}
```

**Проверка:**
```sql
SELECT * FROM orders WHERE order_id = 456; -- 0 rows
SELECT * FROM clients WHERE client_id = 123; -- 0 rows
SELECT * FROM order_items WHERE order_id = 456; -- 0 rows (каскад)
SELECT * FROM admin_logs WHERE entity_id IN (456, 123) AND action = 'DELETE';
-- 2 rows: удаление заказа + удаление клиента
```

---

### Тест 3: Удаление бронирования

```bash
curl -X DELETE "http://localhost:3001/api/bookings/789?adminId=1&comment=Отмена брони"
```

**Проверка:**
```sql
SELECT * FROM bookings WHERE booking_id = 789; -- 0 rows
SELECT * FROM orders WHERE booking_id = 789; -- 0 rows (удалены вручную)
SELECT * FROM admin_logs WHERE entity_type IN ('Booking', 'Order') AND action = 'DELETE';
```

---

## 7️⃣ Архитектурные решения

### Clean Architecture слои:

```
┌─────────────────────────────────────┐
│  Restaurant.Api                     │ ← Controllers, DTOs
│  (ClientsController, OrdersController) │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│  Restaurant.Application             │ ← Business Logic, DTOs
│  (CreateClientWithOrderDto)         │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│  Restaurant.Domain                  │ ← Entities
│  (Client, Order, OrderItem, AdminLog) │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│  Restaurant.Infrastructure          │ ← EF Core, DbContext
│  (AppDbContext, Migrations)         │
└─────────────────────────────────────┘
```

### Преимущества:
- ✅ Разделение ответственности
- ✅ Тестируемость (транзакции можно мокировать)
- ✅ Масштабируемость (легко добавить новые endpoints)
- ✅ Прозрачность (все операции логируются)

---

## 8️⃣ Итог

### Реализовано:

1. ✅ **Каскадные связи:**
   - `Client` → `Order` (ON DELETE CASCADE)
   - `Order` → `OrderItem` (ON DELETE CASCADE)
   - `Booking` → `Order` (ON DELETE SET NULL)

2. ✅ **API Endpoints:**
   - `POST /api/clients` - создание клиента с заказом (транзакция)
   - `DELETE /api/clients/{id}` - каскадное удаление
   - `DELETE /api/orders/{id}` - удаление с проверкой клиента
   - `DELETE /api/bookings/{id}` - удаление с заказами

3. ✅ **Таблица логов:**
   - `admin_logs` с JSONB snapshot
   - Триггеры для автоматического логирования
   - Индексы для быстрого поиска

4. ✅ **Защита транзакций:**
   - BEGIN / COMMIT / ROLLBACK
   - Try-catch обработка
   - FK constraints
   - Логирование ошибок

5. ✅ **Автоматика:**
   - Удаление клиента при удалении последнего заказа
   - Логирование всех операций
   - Каскадное удаление OrderItems

### Файлы:

```
backend/
├── migrations/
│   └── 003_client_orders_cascade.sql ← SQL миграция
├── Restaurant.Domain/Entities/
│   ├── Client.cs ← Обновлен (Orders collection)
│   ├── Order.cs ← Обновлен (ClientId, Client navigation)
│   └── AdminLog.cs ← Создан
├── Restaurant.Application/DTOs/
│   ├── MenuDto.cs
│   └── ClientDto.cs ← Создан
├── Restaurant.Infrastructure/Persistence/
│   └── AppDbContext.cs ← Обновлен (AdminLogs, cascades)
└── Restaurant.Api/Controllers/
    ├── ClientsController.cs ← Создан
    ├── OrdersController.cs ← Обновлен (DELETE метод)
    └── BookingController.cs ← Обновлен (DELETE с логами)
```

---

**Готово к применению!** 🚀
