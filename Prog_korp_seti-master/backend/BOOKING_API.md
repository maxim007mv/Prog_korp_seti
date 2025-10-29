# API Бронирования Столов - Документация и Тестирование

## Обзор

Полнофункциональная система бронирования столов ресторана с расширенным поиском по номеру телефона.

**Базовый URL:** `http://localhost:5000` (или порт из вашего appsettings.json)

**Формат данных:** JSON

---

## Эндпоинты API

### 1. Создать бронирование

**POST** `/api/bookings`

Создает новое бронирование стола с валидацией времени и проверкой конфликтов.

#### Тело запроса (CreateBookingDto)

```json
{
  "tableId": 1,
  "clientName": "Иван Петров",
  "clientPhone": "+7 (912) 345-67-89",
  "clientEmail": "ivan@example.com",
  "startTime": "2025-10-25T18:00:00",
  "endTime": "2025-10-25T20:00:00",
  "comment": "У окна, день рождения"
}
```

#### Параметры

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| `tableId` | int | ✅ | ID стола (должен существовать и быть активным) |
| `clientName` | string | ✅ | Имя клиента (2-100 символов) |
| `clientPhone` | string | ✅ | Телефон (российский формат, 10-20 символов) |
| `clientEmail` | string | ❌ | Email клиента (валидный формат) |
| `startTime` | datetime | ✅ | Время начала (в будущем) |
| `endTime` | datetime | ✅ | Время окончания (после startTime, кратно 30 мин) |
| `comment` | string | ❌ | Комментарий (макс. 500 символов) |

#### Примеры запросов (PowerShell)

**Успешное создание бронирования:**

```powershell
$body = @{
    tableId = 1
    clientName = "Максим Иванов"
    clientPhone = "+79123453535"
    startTime = (Get-Date).AddDays(1).AddHours(18).ToString("yyyy-MM-ddTHH:mm:ss")
    endTime = (Get-Date).AddDays(1).AddHours(20).ToString("yyyy-MM-ddTHH:mm:ss")
    comment = "Бронь у окна на двоих"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" -Method Post -Body $body -ContentType "application/json"
```

**С различными форматами телефона:**

```powershell
# Формат 1: +7
$body = @{
    tableId = 2
    clientName = "Анна Сергеева"
    clientPhone = "+7 926 123 78 90"
    startTime = (Get-Date).AddDays(2).AddHours(12).ToString("yyyy-MM-ddTHH:mm:ss")
    endTime = (Get-Date).AddDays(2).AddHours(14).ToString("yyyy-MM-ddTHH:mm:ss")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" -Method Post -Body $body -ContentType "application/json"

# Формат 2: 8
$body = @{
    tableId = 3
    clientName = "Елена Попова"
    clientPhone = "8-916-777-12-34"
    startTime = (Get-Date).AddDays(1).AddHours(17).ToString("yyyy-MM-ddTHH:mm:ss")
    endTime = (Get-Date).AddDays(1).AddHours(18.5).ToString("yyyy-MM-ddTHH:mm:ss")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" -Method Post -Body $body -ContentType "application/json"
```

#### Ответы

**201 Created** - Бронирование создано

```json
{
  "id": 5,
  "clientName": "Максим Иванов",
  "clientPhone": "+79123453535",
  "phoneLastFour": "3535",
  "startTime": "2025-10-25T18:00:00",
  "endTime": "2025-10-25T20:00:00",
  "comment": "Бронь у окна на двоих",
  "status": "активно",
  "table": {
    "id": 1,
    "location": "у окна",
    "seats": 2
  },
  "createdAt": "2025-10-24T10:30:00"
}
```

**400 Bad Request** - Ошибка валидации

```json
{
  "error": "Время окончания должно быть позже времени начала",
  "field": "endTime"
}
```

**404 Not Found** - Стол не найден

```json
{
  "error": "Стол не найден или неактивен",
  "tableId": 999
}
```

**409 Conflict** - Конфликт времени

```json
{
  "error": "Стол уже забронирован на указанное время",
  "tableId": 1,
  "requestedTime": {
    "start": "2025-10-25T18:00:00",
    "end": "2025-10-25T20:00:00"
  }
}
```

---

### 2. Поиск бронирований (ПЗ-3)

**GET** `/api/bookings/search?phone={phone}&name={name}`

Поиск активных бронирований по номеру телефона и/или имени клиента.

#### Параметры запроса

| Параметр | Тип | Обязательно | Описание |
|----------|-----|-------------|----------|
| `phone` | string | ❌* | Номер телефона (минимум 4 цифры) |
| `name` | string | ❌* | Имя клиента (частичное совпадение) |

*Хотя бы один параметр обязателен

#### Примеры запросов (PowerShell)

**Поиск по последним 4 цифрам телефона:**

```powershell
# Найти все бронирования с телефоном *3535
Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/search?phone=3535" -Method Get

# Или с именем
Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/search?phone=3535&name=Макс" -Method Get
```

**Поиск только по имени:**

```powershell
# Частичное совпадение (найдет Макс, Максим, Максимилиан)
Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/search?name=Макс" -Method Get

# Поиск Анны
Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/search?name=Анна" -Method Get
```

**Комбинированный поиск (phone + name):**

```powershell
# Самый точный поиск
Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/search?phone=3535&name=Максим" -Method Get
```

#### Ответы

**200 OK** - Результаты найдены (или пустой список)

```json
{
  "count": 3,
  "bookings": [
    {
      "id": 1,
      "clientName": "Макс",
      "clientPhone": "+79123453535",
      "phoneLastFour": "3535",
      "startTime": "2025-10-25T18:00:00",
      "endTime": "2025-10-25T20:00:00",
      "comment": "Бронь у окна на двоих",
      "status": "активно",
      "table": {
        "id": 1,
        "location": "у окна",
        "seats": 2
      },
      "createdAt": "2025-10-24T10:00:00"
    },
    {
      "id": 2,
      "clientName": "Максим",
      "clientPhone": "+79876543535",
      "phoneLastFour": "3535",
      "startTime": "2025-10-26T19:00:00",
      "endTime": "2025-10-26T21:00:00",
      "comment": "День рождения, нужен торт",
      "status": "активно",
      "table": {
        "id": 2,
        "location": "у окна",
        "seats": 4
      },
      "createdAt": "2025-10-24T11:00:00"
    },
    {
      "id": 3,
      "clientName": "Максимилиан",
      "clientPhone": "+79991113535",
      "phoneLastFour": "3535",
      "startTime": "2025-10-27T20:00:00",
      "endTime": "2025-10-27T22:00:00",
      "comment": "VIP зона, бизнес встреча",
      "status": "активно",
      "table": {
        "id": 9,
        "location": "VIP зона",
        "seats": 6
      },
      "createdAt": "2025-10-24T12:00:00"
    }
  ]
}
```

**400 Bad Request** - Некорректные параметры

```json
{
  "error": "Необходимо указать хотя бы один параметр: phone или name",
  "message": "Please provide at least one search parameter: phone or name"
}
```

---

### 3. Получить бронирование по ID

**GET** `/api/bookings/{id}`

Получить детали конкретного бронирования.

#### Пример запроса

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/1" -Method Get
```

#### Ответы

**200 OK**

```json
{
  "id": 1,
  "clientName": "Максим Иванов",
  "clientPhone": "+79123453535",
  "phoneLastFour": "3535",
  "startTime": "2025-10-25T18:00:00",
  "endTime": "2025-10-25T20:00:00",
  "comment": "Бронь у окна на двоих",
  "status": "активно",
  "table": {
    "id": 1,
    "location": "у окна",
    "seats": 2
  },
  "createdAt": "2025-10-24T10:30:00"
}
```

**404 Not Found**

```json
{
  "error": "Бронирование не найдено"
}
```

---

### 4. Получить все бронирования

**GET** `/api/bookings?status={status}`

Получить список всех бронирований с опциональной фильтрацией по статусу.

#### Параметры запроса

| Параметр | Тип | Обязательно | Описание |
|----------|-----|-------------|----------|
| `status` | string | ❌ | Фильтр по статусу (активно, завершено, отменено) |

#### Примеры запросов

```powershell
# Все бронирования
Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" -Method Get

# Только активные
Invoke-RestMethod -Uri "http://localhost:5000/api/bookings?status=активно" -Method Get

# Завершенные
Invoke-RestMethod -Uri "http://localhost:5000/api/bookings?status=завершено" -Method Get
```

---

### 5. Обновить бронирование

**PUT** `/api/bookings/{id}`

Обновить существующее бронирование (частичное обновление).

#### Тело запроса

```json
{
  "clientName": "Максим Петрович Иванов",
  "clientPhone": "+79123453536",
  "startTime": "2025-10-25T19:00:00",
  "endTime": "2025-10-25T21:00:00",
  "comment": "Изменено: теперь на 19:00",
  "status": "активно"
}
```

#### Пример запроса

```powershell
$body = @{
    comment = "Обновленный комментарий: нужен высокий стул для ребенка"
    status = "активно"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/1" -Method Put -Body $body -ContentType "application/json"
```

#### Ответы

**200 OK** - Бронирование обновлено

**404 Not Found** - Бронирование не найдено

---

### 6. Отменить бронирование

**DELETE** `/api/bookings/{id}`

Отменить бронирование (мягкое удаление, меняет статус на "отменено").

#### Пример запроса

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/1" -Method Delete
```

#### Ответы

**204 No Content** - Бронирование отменено

**404 Not Found** - Бронирование не найдено

---

## Тестовые сценарии

### Сценарий 1: Полный цикл бронирования

```powershell
# 1. Создать бронирование
$newBooking = @{
    tableId = 1
    clientName = "Тест Клиент"
    clientPhone = "+79991234567"
    startTime = (Get-Date).AddDays(3).AddHours(18).ToString("yyyy-MM-ddTHH:mm:ss")
    endTime = (Get-Date).AddDays(3).AddHours(20).ToString("yyyy-MM-ddTHH:mm:ss")
    comment = "Тестовое бронирование"
} | ConvertTo-Json

$created = Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" -Method Post -Body $newBooking -ContentType "application/json"
Write-Host "Создано бронирование #$($created.id)"

# 2. Найти по телефону
$found = Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/search?phone=4567" -Method Get
Write-Host "Найдено бронирований: $($found.count)"

# 3. Обновить комментарий
$update = @{
    comment = "Обновленный комментарий"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/$($created.id)" -Method Put -Body $update -ContentType "application/json"
Write-Host "Бронирование обновлено"

# 4. Отменить бронирование
Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/$($created.id)" -Method Delete
Write-Host "Бронирование отменено"
```

### Сценарий 2: Проверка поиска по последним 4 цифрам

```powershell
# Создаем 3 бронирования с одинаковыми последними 4 цифрами
$phones = @("+79123453535", "+79876543535", "+79991113535")
$names = @("Макс", "Максим", "Максимилиан")

for ($i = 0; $i -lt 3; $i++) {
    $booking = @{
        tableId = $i + 1
        clientName = $names[$i]
        clientPhone = $phones[$i]
        startTime = (Get-Date).AddDays($i + 1).AddHours(18).ToString("yyyy-MM-ddTHH:mm:ss")
        endTime = (Get-Date).AddDays($i + 1).AddHours(20).ToString("yyyy-MM-ddTHH:mm:ss")
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" -Method Post -Body $booking -ContentType "application/json"
}

# Поиск по последним 4 цифрам
$results = Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/search?phone=3535" -Method Get
Write-Host "Найдено бронирований с *3535: $($results.count)"
$results.bookings | ForEach-Object { Write-Host "- $($_.clientName): $($_.clientPhone)" }

# Поиск с именем
$filtered = Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/search?phone=3535&name=Максим" -Method Get
Write-Host "`nОтфильтровано по имени 'Максим': $($filtered.count)"
```

### Сценарий 3: Тестирование валидации

```powershell
# Тест 1: Некорректное время (прошлое)
try {
    $pastBooking = @{
        tableId = 1
        clientName = "Тест"
        clientPhone = "+79991234567"
        startTime = (Get-Date).AddDays(-1).ToString("yyyy-MM-ddTHH:mm:ss")
        endTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" -Method Post -Body $pastBooking -ContentType "application/json"
} catch {
    Write-Host "✓ Ошибка валидации времени перехвачена"
}

# Тест 2: Некорректная длительность (не кратно 30 мин)
try {
    $invalidDuration = @{
        tableId = 1
        clientName = "Тест"
        clientPhone = "+79991234567"
        startTime = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss")
        endTime = (Get-Date).AddDays(1).AddMinutes(45).ToString("yyyy-MM-ddTHH:mm:ss")
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" -Method Post -Body $invalidDuration -ContentType "application/json"
} catch {
    Write-Host "✓ Ошибка валидации длительности перехвачена"
}

# Тест 3: Конфликт бронирования
try {
    # Создаем первое бронирование
    $first = @{
        tableId = 1
        clientName = "Первый"
        clientPhone = "+79991111111"
        startTime = (Get-Date).AddDays(5).AddHours(18).ToString("yyyy-MM-ddTHH:mm:ss")
        endTime = (Get-Date).AddDays(5).AddHours(20).ToString("yyyy-MM-ddTHH:mm:ss")
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" -Method Post -Body $first -ContentType "application/json"
    
    # Пытаемся создать конфликтующее
    $conflict = @{
        tableId = 1
        clientName = "Второй"
        clientPhone = "+79992222222"
        startTime = (Get-Date).AddDays(5).AddHours(19).ToString("yyyy-MM-ddTHH:mm:ss")
        endTime = (Get-Date).AddDays(5).AddHours(21).ToString("yyyy-MM-ddTHH:mm:ss")
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" -Method Post -Body $conflict -ContentType "application/json"
} catch {
    Write-Host "✓ Конфликт бронирования перехвачен"
}
```

---

## Особенности реализации

### Нормализация телефона

Система автоматически нормализует различные форматы российских номеров:

- `+7 (912) 345-35-35` → `+79123453535`
- `8 912 345 35 35` → `+79123453535`
- `+7-912-345-35-35` → `+79123453535`
- `9123453535` → `+79123453535`

### Поиск по телефону

- Поддерживает частичное совпадение (минимум 4 цифры)
- Нечувствителен к регистру для имени (ILIKE)
- Использует индексы PostgreSQL для быстрого поиска
- Возвращает максимум 50 результатов

### Валидация времени

- Время начала должно быть в будущем (допуск 5 минут)
- Длительность кратна 30 минутам
- Минимальная длительность: 30 минут
- Автоматическая проверка конфликтов

---

## Коды ошибок

| Код | Описание | Причина |
|-----|----------|---------|
| 200 | OK | Операция успешна |
| 201 | Created | Бронирование создано |
| 204 | No Content | Бронирование отменено |
| 400 | Bad Request | Ошибка валидации |
| 404 | Not Found | Ресурс не найден |
| 409 | Conflict | Конфликт времени бронирования |
| 500 | Internal Server Error | Внутренняя ошибка сервера |

---

## Rate Limiting

Для предотвращения злоупотреблений рекомендуется настроить rate limiting:

- Максимум 100 запросов в минуту на IP
- Максимум 10 созданий бронирований в час на IP

---

## Дополнительные возможности

### Расширение для поиска по email

```csharp
// В SearchBookingDto добавить:
public string? Email { get; set; }

// В контроллере:
if (!string.IsNullOrWhiteSpace(email))
{
    query = query.Where(b => EF.Functions.ILike(b.ClientEmail, $"%{email}%"));
}
```

### Расширение для поиска по дате

```csharp
// В SearchBookingDto добавить:
public DateTime? BookingDate { get; set; }

// В контроллере:
if (bookingDate.HasValue)
{
    var startOfDay = bookingDate.Value.Date;
    var endOfDay = startOfDay.AddDays(1);
    query = query.Where(b => b.StartTime >= startOfDay && b.StartTime < endOfDay);
}
```

---

## Логирование

Все операции логируются с использованием `ILogger`:

- Создание бронирования
- Обновление бронирования
- Отмена бронирования
- Поисковые запросы
- Ошибки валидации

Пример лога:

```
[2025-10-24 10:30:15] INFO: Создано бронирование #5 для Максим Иванов, стол 1, время 2025-10-25T18:00:00-2025-10-25T20:00:00
[2025-10-24 10:35:22] INFO: Поиск бронирований: phone=3535, name=Макс
[2025-10-24 10:35:22] INFO: Найдено бронирований: 3
```

---

## База данных

### Применение SQL-скрипта с тестовыми данными

```powershell
# Подключиться к PostgreSQL и выполнить скрипт
psql -U postgres -d restaurant_db -f "C:\Users\Damir\OneDrive\Рабочий стол\Предметы\КР РП\backend\seed_bookings_test_data.sql"
```

### Проверка данных

```sql
-- Проверить количество бронирований
SELECT COUNT(*) FROM bookings;

-- Посмотреть все активные бронирования
SELECT booking_id, client_name, client_phone, 
       RIGHT(client_phone, 4) as last_four, 
       start_time, status
FROM bookings
WHERE status = 'активно'
ORDER BY start_time;
```

---

## Контакты и поддержка

Для вопросов и предложений по API обращайтесь к команде разработки.
