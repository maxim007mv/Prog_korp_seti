# Быстрый старт: Каскадные связи Client-Order

## 🚀 Применение миграции

### Автоматически (рекомендуется)

```powershell
# Запустить скрипт применения
.\apply_migration_003.ps1
```

Скрипт выполнит:
1. Проверку подключения к PostgreSQL
2. Создание резервной копии БД
3. Применение миграции 003
4. Проверку корректности установки

### Вручную

```powershell
# Подключиться к БД
psql -h localhost -U postgres -d restaurant_db

# Выполнить миграцию
\i backend/migrations/003_client_orders_cascade.sql

# Проверить
\dt admin_logs
\d orders
```

---

## 📡 Тестирование API

### 1. Создать клиента с заказом

```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Иван",
    "lastName": "Петров",
    "phone": "+79991234567",
    "email": "ivan@test.com",
    "tableId": 1,
    "waiterId": 1,
    "items": [
      {"dishId": 1, "quantity": 2},
      {"dishId": 5, "quantity": 1}
    ]
  }'
```

**Ответ:**
```json
{
  "clientId": 1,
  "clientName": "Иван Петров",
  "phone": "+79991234567",
  "orderId": 1,
  "totalPrice": 1250.00,
  "createdAt": "2025-01-24T18:42:00Z"
}
```

---

### 2. Получить список клиентов

```bash
curl http://localhost:3001/api/clients
```

**Ответ:**
```json
[
  {
    "id": 1,
    "name": "Иван Петров",
    "phone": "+79991234567",
    "email": "ivan@test.com",
    "ordersCount": 1,
    "loyaltyPoints": 0,
    "registrationDate": "2025-01-24T18:42:00Z"
  }
]
```

---

### 3. Получить детали клиента

```bash
curl http://localhost:3001/api/clients/1
```

**Ответ:**
```json
{
  "id": 1,
  "name": "Иван Петров",
  "phone": "+79991234567",
  "email": "ivan@test.com",
  "loyaltyPoints": 0,
  "registrationDate": "2025-01-24T18:42:00Z",
  "orders": [
    {
      "id": 1,
      "startTime": "2025-01-24T18:42:00Z",
      "endTime": null,
      "totalPrice": 1250.00,
      "status": "активен",
      "itemsCount": 3
    }
  ]
}
```

---

### 4. Удалить заказ (автоудаление клиента)

```bash
curl -X DELETE "http://localhost:3001/api/orders/1?adminId=1&comment=Тест каскада"
```

**Ответ (если это последний заказ):**
```json
{
  "message": "Заказ удален. Клиент ID: 1 также удален (последний заказ)",
  "deletedOrderId": 1,
  "deletedClientId": 1
}
```

**Ответ (если есть другие заказы):**
```json
{
  "message": "Заказ удален",
  "deletedOrderId": 1,
  "deletedClientId": null
}
```

---

### 5. Удалить клиента (каскадное удаление заказов)

```bash
curl -X DELETE "http://localhost:3001/api/clients/1?adminId=1&comment=Удаление клиента"
```

**Ответ:**
```json
{
  "message": "Клиент и все его заказы успешно удалены",
  "deletedClientId": 1,
  "deletedOrdersCount": 3
}
```

---

### 6. Удалить бронирование (с заказами)

```bash
curl -X DELETE "http://localhost:3001/api/bookings/1?adminId=1&comment=Отмена брони"
```

**Ответ:**
```json
{
  "message": "Бронирование отменено. Удалено заказов: 2",
  "deletedBookingId": 1,
  "deletedOrdersCount": 2
}
```

---

## 🔍 Проверка логов

### SQL запрос

```sql
-- Все логи за последний час
SELECT 
    log_id,
    admin_username,
    action,
    entity_type,
    entity_id,
    comment,
    timestamp
FROM admin_logs
WHERE timestamp > NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;
```

### Фильтр по типу действия

```sql
-- Только удаления
SELECT * FROM admin_logs WHERE action = 'DELETE' ORDER BY timestamp DESC LIMIT 10;

-- Только создания клиентов
SELECT * FROM admin_logs WHERE entity_type = 'ClientOrder' AND action = 'CREATE';

-- Удаления с деталями
SELECT 
    entity_type,
    entity_id,
    entity_data->>'Phone' AS phone,
    entity_data->>'TotalPrice' AS total_price,
    comment,
    timestamp
FROM admin_logs
WHERE action = 'DELETE'
ORDER BY timestamp DESC;
```

---

## 🔄 Сценарии использования

### Сценарий 1: Walk-in клиент (без бронирования)

```json
POST /api/clients
{
  "firstName": "Анна",
  "lastName": "Смирнова",
  "phone": "+79995556677",
  "tableId": 5,
  "waiterId": 2,
  "bookingId": null,  // ← без брони
  "items": [{"dishId": 10, "quantity": 1}]
}
```

**Результат:** Создан клиент + заказ (isWalkIn = true)

---

### Сценарий 2: Клиент с бронированием

```json
POST /api/clients
{
  "firstName": "Петр",
  "lastName": "Иванов",
  "phone": "+79991112233",
  "tableId": 3,
  "waiterId": 1,
  "bookingId": 15,  // ← связь с бронью
  "items": [{"dishId": 20, "quantity": 2}]
}
```

**Результат:** Создан клиент + заказ, привязанный к брони

---

### Сценарий 3: Повторный заказ существующего клиента

```json
POST /api/clients
{
  "phone": "+79991112233",  // ← существующий телефон
  "tableId": 4,
  "items": [{"dishId": 5, "quantity": 1}]
}
```

**Результат:** Клиент НЕ создается (найден по телефону), создается новый заказ для него

---

### Сценарий 4: Отмена последнего заказа клиента

```bash
# Клиент ID 5 имеет 1 заказ (ID 100)
DELETE /api/orders/100?adminId=1
```

**Результат:**
- Удален заказ 100
- Удален клиент 5 (автоматически, т.к. заказов больше нет)
- 2 записи в admin_logs

---

### Сценарий 5: Удаление клиента с несколькими заказами

```bash
# Клиент ID 10 имеет 3 заказа (ID 200, 201, 202)
DELETE /api/clients/10
```

**Результат:**
- Удален клиент 10
- Удалены заказы 200, 201, 202 (каскадно через FK)
- Удалены все order_items для этих заказов (каскадно)
- 1 запись в admin_logs (+ триггеры залогируют каждый заказ)

---

## 📊 Диаграмма потока данных

```
┌─────────────┐
│  Frontend   │
│  Admin UI   │
└──────┬──────┘
       │ DELETE /api/bookings/123
       ▼
┌─────────────────┐
│ BookingController │ ← Транзакция начинается
│  CancelBooking() │
└──────┬──────────┘
       │
       ├─► 1. Fetch booking + orders
       ├─► 2. Log booking deletion → admin_logs
       ├─► 3. For each order:
       │       ├─► Log order deletion → admin_logs
       │       └─► DELETE order → OrderItems каскад
       ├─► 4. DELETE booking
       └─► 5. COMMIT или ROLLBACK
```

---

## ⚠️ Важные замечания

### 1. **Каскадное удаление работает только через FK constraints**

❌ **Неправильно:**
```csharp
// EF Core не удалит связанные entities автоматически без FK
_context.Clients.Remove(client);
await _context.SaveChangesAsync();
// Заказы останутся с client_id = X
```

✅ **Правильно:**
```csharp
// С FK ON DELETE CASCADE:
_context.Clients.Remove(client);
await _context.SaveChangesAsync();
// PostgreSQL автоматически удалит все orders WHERE client_id = X
```

---

### 2. **Транзакции обязательны для сложных операций**

❌ **Неправильно:**
```csharp
_context.Clients.Add(client);
await _context.SaveChangesAsync();
// ← Если ошибка ниже, клиент останется без заказа!
_context.Orders.Add(order);
await _context.SaveChangesAsync();
```

✅ **Правильно:**
```csharp
using var transaction = await _context.Database.BeginTransactionAsync();
try {
    _context.Clients.Add(client);
    await _context.SaveChangesAsync();
    
    _context.Orders.Add(order);
    await _context.SaveChangesAsync();
    
    await transaction.CommitAsync(); // ← Все или ничего
} catch {
    await transaction.RollbackAsync();
}
```

---

### 3. **Всегда логируйте удаления**

✅ **Обязательно:**
```csharp
// Snapshot ПЕРЕД удалением
var snapshot = JsonSerializer.Serialize(order);

var log = new AdminLog {
    Action = "DELETE",
    EntityType = "Order",
    EntityData = snapshot // ← Важно!
};
_context.AdminLogs.Add(log);

_context.Orders.Remove(order);
await _context.SaveChangesAsync();
```

---

## 🛠️ Отладка

### Проблема: "Foreign key violation"

**Симптом:**
```
ERROR: update or delete on table "clients" violates foreign key constraint "fk_orders_client"
```

**Причина:** FK constraint не имеет ON DELETE CASCADE

**Решение:**
```sql
-- Проверить constraint
SELECT * FROM information_schema.table_constraints 
WHERE constraint_name = 'fk_orders_client';

-- Пересоздать с CASCADE
ALTER TABLE orders DROP CONSTRAINT fk_orders_client;
ALTER TABLE orders ADD CONSTRAINT fk_orders_client 
    FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE CASCADE;
```

---

### Проблема: "Клиент не удаляется автоматически"

**Симптом:** DELETE order не удаляет клиента

**Причина:** Триггер не сработал или у клиента есть другие заказы

**Отладка:**
```sql
-- Проверить триггер
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trg_check_client_orders_after_delete';

-- Проверить другие заказы клиента
SELECT * FROM orders WHERE client_id = X;

-- Проверить логи триггера
SELECT * FROM admin_logs WHERE entity_type = 'Client' AND action = 'DELETE' 
ORDER BY timestamp DESC LIMIT 5;
```

---

## 📚 Дополнительные ресурсы

- **Полный технический отчет:** [CLIENT_ORDER_CASCADE_REPORT.md](CLIENT_ORDER_CASCADE_REPORT.md)
- **SQL миграция:** [backend/migrations/003_client_orders_cascade.sql](backend/migrations/003_client_orders_cascade.sql)
- **API документация:** Swagger UI на http://localhost:3001/swagger
- **Entity диаграмма:** Mermaid схема в техническом отчете

---

**Готово к работе!** 🎉

Если возникли вопросы, см. полный технический отчет или логи в `admin_logs` таблице.
