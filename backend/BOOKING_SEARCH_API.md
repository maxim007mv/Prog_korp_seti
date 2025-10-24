# API Поиска Бронирований

## Описание

Эндпоинт для поиска бронирований столов в ресторане по номеру телефона и имени клиента. Реализует требование **ПЗ-3**: поиск брони стола по последним 4 цифрам номера телефона и имени клиента.

---

## Эндпоинт

### `GET /api/bookings/search`

Поиск активных бронирований по параметрам телефона и/или имени клиента.

#### Query Параметры

| Параметр | Тип    | Обязательный | Описание                                                |
|----------|--------|-------------|---------------------------------------------------------|
| `phone`  | string | Нет*        | Номер телефона (минимум 4 цифры). Поддерживает частичное совпадение |
| `name`   | string | Нет*        | Имя клиента (частичное совпадение, регистронезависимо) |

\* **Важно**: хотя бы один параметр должен быть указан.

---

## Примеры запросов

### 1. Поиск по последним 4 цифрам телефона

```bash
curl -X GET "http://localhost:5235/api/bookings/search?phone=1234"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:5235/api/bookings/search?phone=1234" -Method Get
```

### 2. Поиск по имени

```bash
curl -X GET "http://localhost:5235/api/bookings/search?name=Иван"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:5235/api/bookings/search?name=Иван" -Method Get
```

### 3. Комбинированный поиск (имя + телефон)

```bash
curl -X GET "http://localhost:5235/api/bookings/search?phone=5555&name=Петров"
```

```powershell
Invoke-RestMethod -Uri "http://localhost:5235/api/bookings/search?phone=5555&name=Петров" -Method Get
```

### 4. Поиск с форматированным номером

```bash
# Бэкенд автоматически нормализует номер, удаляя пробелы и спецсимволы
curl -X GET "http://localhost:5235/api/bookings/search?phone=+7%20(999)%20123-45-67"
```

---

## Ответы

### Успешный ответ (200 OK)

```json
{
  "count": 2,
  "bookings": [
    {
      "id": 1,
      "clientName": "Иван Иванов",
      "clientPhone": "+79991234567",
      "phoneLastFour": "4567",
      "startTime": "2025-10-24T19:00:00Z",
      "endTime": "2025-10-24T21:00:00Z",
      "comment": "У окна, пожалуйста",
      "status": "активно",
      "table": {
        "id": 5,
        "location": "у окна",
        "seats": 4
      },
      "createdAt": "2025-10-20T10:00:00Z"
    },
    {
      "id": 3,
      "clientName": "Иван Петров",
      "clientPhone": "+79161234567",
      "phoneLastFour": "4567",
      "startTime": "2025-10-25T18:00:00Z",
      "endTime": "2025-10-25T20:00:00Z",
      "comment": null,
      "status": "активно",
      "table": {
        "id": 8,
        "location": "в глубине зала",
        "seats": 2
      },
      "createdAt": "2025-10-21T14:30:00Z"
    }
  ]
}
```

### Пустой результат (200 OK)

```json
{
  "count": 0,
  "bookings": []
}
```

### Ошибка валидации (400 Bad Request)

```json
{
  "error": "Необходимо указать хотя бы один параметр: phone или name",
  "message": "Please provide at least one search parameter: phone or name"
}
```

```json
{
  "error": "Номер телефона должен содержать минимум 4 цифры",
  "message": "Phone number must contain at least 4 digits"
}
```

### Внутренняя ошибка сервера (500)

```json
{
  "error": "Внутренняя ошибка сервера",
  "message": "An error occurred while searching bookings"
}
```

---

## Особенности реализации

### Backend (.NET 8)

#### 1. Нормализация телефона
```csharp
// Из номера "+7 (999) 123-45-67" получаем "+79991234567"
var normalized = phone.NormalizePhone(); // Удаление пробелов, скобок, дефисов
```

#### 2. Поиск через ILIKE (PostgreSQL)
```csharp
// Case-insensitive поиск с частичным совпадением
query = query.Where(b => 
    EF.Functions.ILike(b.ClientPhone, $"%{normalizedPhone}%")
);
```

#### 3. Фильтрация активных бронирований
```csharp
// Поиск только среди активных броней
.Where(b => b.Status == "активно")
```

#### 4. Ограничение результатов
```csharp
// Лимит 50 записей для производительности
.Take(50)
```

### Frontend (Next.js + TypeScript)

#### 1. React Hook с debounce
```typescript
const { data, isLoading } = useSearchBookings({
  name: debouncedName,
  phoneSuffix: debouncedPhone
});
```

#### 2. Валидация через Zod
```typescript
const validated = bookingSearchSchema.parse({
  name: name.trim(),
  phoneSuffix: phone.replace(/\D/g, '').slice(-4)
});
```

#### 3. Форматирование отображения
```typescript
// +7 (999) 123-45-67
const formatPhoneDisplay = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
};
```

---

## Тестирование

### Сценарий 1: Успешный поиск по телефону
```bash
# Шаг 1: Создать тестовое бронирование
curl -X POST "http://localhost:5235/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Тест Тестов",
    "phone": "+79991234567",
    "start": "2025-10-25T19:00:00Z",
    "end": "2025-10-25T21:00:00Z",
    "tableId": 1,
    "guests": 2
  }'

# Шаг 2: Найти по последним 4 цифрам
curl -X GET "http://localhost:5235/api/bookings/search?phone=4567"

# Ожидаемый результат: бронирование найдено
```

### Сценарий 2: Поиск несуществующего номера
```bash
curl -X GET "http://localhost:5235/api/bookings/search?phone=9999"

# Ожидаемый результат: { "count": 0, "bookings": [] }
```

### Сценарий 3: Комбинированный поиск
```bash
curl -X GET "http://localhost:5235/api/bookings/search?phone=4567&name=Тест"

# Ожидаемый результат: только бронирования, совпадающие по обоим параметрам
```

### Сценарий 4: Невалидные данные
```bash
# Слишком короткий телефон (меньше 4 цифр)
curl -X GET "http://localhost:5235/api/bookings/search?phone=12"

# Ожидаемый результат: 400 Bad Request
```

---

## Адаптация для других полей

### Поиск по email
```csharp
// Модифицируйте SearchBookings в BookingController.cs
if (!string.IsNullOrWhiteSpace(email))
{
    var normalizedEmail = email.Trim().ToLower();
    query = query.Where(b => 
        EF.Functions.ILike(b.ClientEmail, $"%{normalizedEmail}%")
    );
}
```

### Поиск по диапазону дат
```csharp
[HttpGet("search")]
public async Task<IActionResult> SearchBookings(
    [FromQuery] DateTime? startDate,
    [FromQuery] DateTime? endDate)
{
    if (startDate.HasValue && endDate.HasValue)
    {
        query = query.Where(b => 
            b.StartTime >= startDate.Value && 
            b.EndTime <= endDate.Value
        );
    }
    // ...
}
```

---

## Производительность

### Индексы в PostgreSQL
База данных использует следующие индексы для оптимизации поиска:

```sql
-- Индекс по номеру телефона
CREATE INDEX idx_bookings_phone ON bookings(client_phone);

-- Индекс по имени клиента
CREATE INDEX idx_bookings_name ON bookings(client_name);

-- Индекс по последним 4 цифрам телефона
CREATE INDEX idx_bookings_phone_last4 ON bookings(RIGHT(client_phone, 4));

-- Индекс по статусу
CREATE INDEX idx_bookings_status ON bookings(status);
```

### Рекомендации
- Ограничение результатов (`Take(50)`) предотвращает перегрузку при большом количестве записей
- ILIKE индексируется через GIN/GiST индексы в PostgreSQL для быстрого текстового поиска
- AsNoTracking() улучшает производительность read-only операций

---

## Безопасность

### Защита от SQL-инъекций
- ✅ Используется Entity Framework с параметризованными запросами
- ✅ Валидация всех входных данных
- ✅ Нормализация перед поиском

### Rate Limiting (опционально)
```csharp
// В Program.cs добавьте rate limiting middleware
builder.Services.AddRateLimiter(options => {
    options.AddFixedWindowLimiter("api", opt => {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 20;
    });
});
```

---

## Поддержка

Для вопросов и багрепортов обращайтесь к документации проекта или создавайте issue в репозитории.

**Версия API**: 1.0  
**Последнее обновление**: 23 октября 2025
