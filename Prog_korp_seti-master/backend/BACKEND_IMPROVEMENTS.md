# Улучшения Backend - Restaurant API

## 🎉 Что было добавлено

### 1. ✅ Глобальная обработка ошибок
**Файлы:**
- `Restaurant.Domain/Exceptions/` - Кастомные исключения
  - `NotFoundException.cs` - Ошибка "не найдено"
  - `ValidationException.cs` - Ошибка валидации
  - `BadRequestException.cs` - Ошибка неправильного запроса
- `Restaurant.Api/Middleware/ExceptionHandlingMiddleware.cs` - Middleware для централизованной обработки

**Преимущества:**
- Единообразная обработка ошибок во всем приложении
- Понятные сообщения об ошибках на русском языке
- Структурированный JSON-ответ с кодом статуса и временной меткой
- Автоматическое логирование всех исключений

**Пример использования:**
```csharp
// В контроллере
var order = await _unitOfWork.Orders.GetByIdAsync(id);
if (order == null)
{
    throw new NotFoundException("Заказ", id);
}
```

### 2. ✅ Валидация с FluentValidation
**Файлы:**
- `Restaurant.Api/Validators/OrderValidators.cs` - Валидаторы для заказов
- `Restaurant.Api/Validators/BookingValidators.cs` - Валидаторы для бронирований
- `Restaurant.Api/Validators/DishValidators.cs` - Валидаторы для блюд

**Что проверяется:**
- ✔️ ID должны быть больше 0
- ✔️ Обязательные поля
- ✔️ Ограничения по длине строк
- ✔️ Формат телефона
- ✔️ Даты в будущем
- ✔️ Допустимые статусы
- ✔️ Диапазоны значений (например, количество гостей)

**Пример валидатора:**
```csharp
public class CreateOrderDtoValidator : AbstractValidator<CreateOrderDto>
{
    public CreateOrderDtoValidator()
    {
        RuleFor(x => x.TableId)
            .GreaterThan(0)
            .WithMessage("ID стола должен быть больше 0");

        RuleFor(x => x.Items)
            .NotEmpty()
            .WithMessage("Заказ должен содержать хотя бы одно блюдо");
    }
}
```

### 3. ✅ Repository Pattern + Unit of Work
**Файлы:**
- `Restaurant.Application/Interfaces/IRepository.cs` - Базовый интерфейс репозитория
- `Restaurant.Application/Interfaces/IRepositories.cs` - Специфичные интерфейсы
- `Restaurant.Application/Interfaces/IUnitOfWork.cs` - Интерфейс Unit of Work
- `Restaurant.Infrastructure/Repositories/Repository.cs` - Базовая реализация
- `Restaurant.Infrastructure/Repositories/SpecificRepositories.cs` - Конкретные репозитории
- `Restaurant.Infrastructure/UnitOfWork/UnitOfWork.cs` - Реализация Unit of Work

**Репозитории:**
- `IOrderRepository` - Работа с заказами
- `IBookingRepository` - Работа с бронированиями
- `IDishRepository` - Работа с блюдами
- `ITableRepository` - Работа со столами
- `IUserRepository` - Работа с пользователями

**Преимущества:**
- Чистая архитектура и разделение ответственности
- Легкое тестирование (можно мокать репозитории)
- Транзакционность через Unit of Work
- Переиспользуемые запросы к БД

**Пример использования:**
```csharp
// В контроллере через Dependency Injection
public class OrdersController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    
    public OrdersController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
    
    public async Task<IActionResult> GetOrder(int id)
    {
        var order = await _unitOfWork.Orders.GetOrderWithItemsAsync(id);
        if (order == null)
            throw new NotFoundException("Заказ", id);
            
        return Ok(order);
    }
}
```

### 4. ✅ Health Checks
**Конфигурация в Program.cs:**
```csharp
builder.Services.AddHealthChecks();
```

**Эндпоинты:**
- `GET /health` - Базовая проверка здоровья
- `GET /health/ready` - Проверка готовности приложения

**Использование:**
- Мониторинг состояния приложения
- Интеграция с Kubernetes/Docker health probes
- Проверка подключения к БД

### 5. ✅ Rate Limiting
**Конфигурация:**
- 100 запросов в минуту на пользователя/IP
- Автоматическое восстановление лимита
- HTTP 429 при превышении

**Защита от:**
- DDoS атак
- Злоупотребления API
- Перегрузки сервера

**Ответ при превышении лимита:**
```json
{
  "error": "Слишком много запросов. Пожалуйста, попробуйте позже.",
  "statusCode": 429
}
```

### 6. ✅ SignalR для Real-time уведомлений
**Файл:**
- `Restaurant.Api/Hubs/OrderHub.cs`

**Методы Hub:**
- `OrderCreated` - Уведомление о создании заказа
- `OrderStatusChanged` - Изменение статуса заказа
- `OrderReady` - Заказ готов
- `BookingCreated` - Новое бронирование
- `JoinRoleGroup` - Присоединение к группе по роли

**Группы пользователей:**
- `Admins` - Администраторы
- `Waiters` - Официанты

**Эндпоинт:**
- `wss://localhost:3001/hubs/orders` (WebSocket)

**Пример использования на фронтенде:**
```typescript
import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:3001/hubs/orders')
    .build();

connection.on('ReceiveOrderCreated', (data) => {
    console.log('Новый заказ:', data);
    // Обновить UI
});

await connection.start();
await connection.invoke('JoinRoleGroup', 'администратор');
```

## 📦 Новые пакеты

Добавлены в `Restaurant.Api.csproj`:
```xml
<PackageReference Include="AspNetCore.HealthChecks.Npgsql" Version="8.0.2" />
<PackageReference Include="Microsoft.AspNetCore.RateLimiting" Version="8.0.11" />
```

## 🔧 Как использовать

### 1. Восстановить пакеты
```powershell
cd backend/Restaurant.Api
dotnet restore
```

### 2. Запустить приложение
```powershell
dotnet run
```

### 3. Проверить Health Checks
```powershell
curl http://localhost:3001/health
```

### 4. Протестировать SignalR
Откройте `/swagger` и найдите эндпоинт `/hubs/orders`

## 🏗️ Архитектура

```
Restaurant.Api/          # API Layer
├── Controllers/         # API контроллеры
├── Middleware/          # Middleware компоненты
├── Validators/          # FluentValidation валидаторы
├── Hubs/               # SignalR hubs
└── Program.cs          # Конфигурация приложения

Restaurant.Application/  # Application Layer
└── Interfaces/         # Интерфейсы репозиториев и сервисов

Restaurant.Infrastructure/ # Infrastructure Layer
├── Repositories/       # Реализации репозиториев
├── UnitOfWork/        # Unit of Work pattern
└── Persistence/       # DbContext

Restaurant.Domain/      # Domain Layer
├── Entities/          # Доменные сущности
└── Exceptions/        # Кастомные исключения
```

## 🎯 Следующие шаги (опционально)

1. **Кэширование с Redis** - Для улучшения производительности
2. **Background Services** - Для периодических задач
3. **Elasticsearch** - Для полнотекстового поиска
4. **API Versioning** - Версионирование API
5. **Response Compression** - Сжатие ответов
6. **Request/Response Logging** - Детальное логирование

## 📝 Примечания

- JWT уже настроен (в исходном коде)
- Serilog настроен для логирования
- AutoMapper настроен для маппинга
- CORS настроен для фронтенда на localhost:3000

## 🐛 Устранение неполадок

### Ошибка компиляции
```powershell
dotnet clean
dotnet restore
dotnet build
```

### Проблемы с БД
Проверьте строку подключения в `appsettings.Development.json`

### SignalR не подключается
Убедитесь, что CORS настроен правильно и включает WebSocket

---

**Все улучшения реализованы и готовы к использованию! 🚀**
