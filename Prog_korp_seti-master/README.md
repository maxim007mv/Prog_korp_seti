# 🚀 Руководство по запуску системы управления рестораном

## 📋 Оглавление
1. [Описание проекта](#описание-проекта)
2. [Требования](#требования)
3. [Быстрый старт](#быстрый-старт)
4. [Детальная инструкция](#детальная-инструкция)
5. [Архитектура системы](#архитектура-системы)
6. [Реализованные паттерны](#реализованные-паттерны)
7. [Решение проблем](#решение-проблем)
8. [Тестовые данные](#тестовые-данные)

---

## 📖 Описание проекта

**Restaurant Management System** - полнофункциональная система управления рестораном с AI-интеграцией.

### Технологический стек:
- **Frontend**: Next.js 14.2.33, React 18, TypeScript, TailwindCSS, TanStack Query v5
- **Backend**: .NET 8.0, ASP.NET Core Web API, Entity Framework Core 8
- **Database**: PostgreSQL 16
- **AI**: DeepSeek API (реальная интеграция)
- **Background Jobs**: Hangfire 1.8.14
- **Logging**: Serilog
- **Architecture**: Clean Architecture, CQRS, Repository Pattern

### Основные функции:
✅ Управление меню и блюдами (1022+ блюд)  
✅ Система бронирования столов  
✅ Управление заказами и персоналом  
✅ Аналитика и отчеты (90 дней истории)  
✅ AI-рекомендации и прогнозирование  
✅ Уведомления в реальном времени  
✅ Роли: Администратор, Официант, Клиент  

---

## 🔧 Требования

### Обязательные компоненты:
1. **Node.js** v18+ и npm/yarn
2. **.NET SDK** 8.0+
3. **PostgreSQL** 16+
4. **Git** для клонирования репозитория

### Проверка установки:
```powershell
node --version   # v18.0.0 или выше
npm --version    # 9.0.0 или выше
dotnet --version # 8.0.0 или выше
psql --version   # 16.0 или выше
```

---

## ⚡ Быстрый старт

### 1. Клонирование репозитория
```powershell
git clone https://github.com/SeyYestyq/Prog_korp_seti.git
cd Prog_korp_seti
```

### 2. Настройка базы данных
```sql
-- Подключитесь к PostgreSQL
psql -U postgres

-- Создайте базу данных
CREATE DATABASE restaurant_db;
```

### 3. Запуск бэкенда (.NET)
```powershell
# Перейдите в директорию бэкенда
cd backend\Restaurant.Api

# Примените миграции (автоматически при первом запуске)
dotnet ef database update --project ..\Restaurant.Infrastructure

# Запустите сервер
dotnet run
```

Бэкенд запустится на **http://localhost:3001**

### 4. Запуск фронтенда (Next.js)
Откройте **новый терминал**:

```powershell
# Вернитесь в корневую директорию
cd ..\..

# Установите зависимости (только при первом запуске)
npm install

# Запустите фронтенд
npm run dev
```

Фронтенд запустится на **http://localhost:3000**

### 5. Вход в систему

Откройте браузер: **http://localhost:3000**

#### Тестовые учетные записи:

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | `admin@restaurant.com` | `admin123` |
| Официант | `waiter1@restaurant.com` | `waiter123` |

---

## 📚 Детальная инструкция

### Настройка переменных окружения

#### Frontend (.env.local)
Создайте файл `.env.local` в корне проекта:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_DEEPSEEK_API_KEY=sk-f6e4ca3f948f4a96ba0926760f12c9d8
```

#### Backend (appsettings.Development.json)
Файл находится в `backend/Restaurant.Api/`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=restaurant_db;Username=postgres;Password=postgres"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### Структура проекта
```
Prog_korp_seti-master/
├── app/                          # Next.js страницы
│   ├── admin/                    # Панель администратора
│   ├── staff/                    # Панель персонала
│   ├── booking/                  # Бронирование столов
│   └── menu/                     # Меню ресторана
├── components/                   # React компоненты
│   ├── features/                 # Функциональные компоненты
│   └── ui/                       # UI библиотека
├── lib/                          # Библиотеки
│   ├── api/                      # API клиент
│   ├── hooks/                    # React хуки
│   └── ai/                       # DeepSeek AI интеграция
├── backend/
│   ├── Restaurant.Api/           # Web API контроллеры
│   ├── Restaurant.Domain/        # Доменные сущности
│   ├── Restaurant.Infrastructure/# EF Core, БД
│   └── GenerateTestData/         # Генератор тестовых данных
└── .github/
    └── copilot-instructions.md   # Документация проекта
```

---

## 🏗️ Архитектура системы

### Backend архитектура

```
┌─────────────────────────────────────────┐
│         Restaurant.Api (WebAPI)         │
│  ┌───────────────────────────────────┐  │
│  │    Controllers Layer              │  │
│  │  - MenuController                 │  │
│  │  - OrdersController               │  │
│  │  - BookingsController             │  │
│  │  - TablesController               │  │
│  │  - AnalyticsController            │  │
│  └───────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      Restaurant.Infrastructure          │
│  ┌───────────────────────────────────┐  │
│  │    AppDbContext (EF Core)         │  │
│  │  - Dishes, Orders, Bookings       │  │
│  │  - Tables, Users, Analytics       │  │
│  └───────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         PostgreSQL Database             │
│  - restaurant_db (16 таблиц)            │
│  - 1022 dishes, 250+ orders             │
│  - 90 дней истории заказов              │
└─────────────────────────────────────────┘
```

### Frontend архитектура

```
┌─────────────────────────────────────────┐
│         Next.js 14 (App Router)         │
│  ┌───────────────────────────────────┐  │
│  │    Pages                          │  │
│  │  /menu    /booking   /admin       │  │
│  │  /staff   /login     /register    │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │    Components (features/)         │  │
│  │  - MenuList  - OrderManager       │  │
│  │  - BookingForm - RevenueChart     │  │
│  │  - AIInsights - NotificationBell  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │    State Management               │  │
│  │  - TanStack Query (API cache)     │  │
│  │  - React Context (Auth)           │  │
│  └───────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         API Client (lib/api/)           │
│  - ApiClient class                      │
│  - Endpoints configuration              │
│  - Request/Response interceptors        │
└─────────────────────────────────────────┘
```

---

## 🎯 Реализованные паттерны

### Backend Enterprise Patterns (13 паттернов)

#### 1. **Clean Architecture**
```
Presentation → Application → Domain → Infrastructure
```
- Независимость от фреймворков
- Тестируемость
- Разделение ответственности

#### 2. **Repository Pattern**
```csharp
public interface IRepository<T> where T : class
{
    Task<T> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(int id);
}
```

#### 3. **CQRS (Command Query Responsibility Segregation)**
- Разделение команд (изменение данных) и запросов (чтение данных)
- Оптимизация производительности

#### 4. **Result Pattern**
```csharp
public class Result<T>
{
    public bool IsSuccess { get; set; }
    public T Data { get; set; }
    public string ErrorMessage { get; set; }
}
```
- Явная обработка ошибок
- Отсутствие исключений в бизнес-логике

#### 5. **Specification Pattern**
- Инкапсуляция бизнес-правил
- Переиспользуемые условия фильтрации

#### 6. **Unit of Work**
- Транзакционная целостность
- Группировка операций с БД

#### 7. **Dependency Injection**
```csharp
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<IOrderService, OrderService>();
```

#### 8. **Background Jobs (Hangfire)**
```csharp
// Очистка истекших бронирований - каждый час
RecurringJob.AddOrUpdate<IBookingService>(
    "cleanup-expired-bookings",
    x => x.CleanupExpiredBookingsAsync(),
    Cron.Hourly
);

// Генерация отчетов - ежедневно в 2:00
RecurringJob.AddOrUpdate<IAnalyticsService>(
    "generate-daily-reports",
    x => x.GenerateDailyReportAsync(),
    "0 2 * * *"
);

// Обновление кэша меню - каждые 15 минут
RecurringJob.AddOrUpdate<IMenuService>(
    "refresh-menu-cache",
    x => x.RefreshMenuCacheAsync(),
    "*/15 * * * *"
);
```

#### 9. **Caching Strategy**
```csharp
// In-Memory Cache для меню
var cachedMenu = await _cache.GetOrCreateAsync(
    "menu_all",
    async entry =>
    {
        entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15);
        return await _context.Dishes.ToListAsync();
    }
);
```

#### 10. **CORS Policy**
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
        .WithExposedHeaders("X-Correlation-ID", "Content-Type", "Authorization");
    });
});
```

#### 11. **Structured Logging (Serilog)**
```csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .Enrich.WithCorrelationId()
    .Enrich.WithMachineName()
    .WriteTo.Console()
    .CreateLogger();
```

#### 12. **Response Compression**
```csharp
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});
```

#### 13. **API Versioning**
```csharp
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
});
```

#### 14. **JSON Serialization (Циклические ссылки)**
```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Исправление циклических ссылок в EF Core навигационных свойствах
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });
```

### Frontend Patterns

#### 1. **Custom Hooks**
```typescript
// lib/hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  // ...authentication logic
}

// lib/hooks/useMenu.ts
export const useMenu = () => {
  return useQuery({
    queryKey: ['menu'],
    queryFn: () => apiClient.get('/menu')
  });
}
```

#### 2. **API Client Pattern**
```typescript
class ApiClient {
  private baseURL: string;

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
}
```

#### 3. **Feature-based Architecture**
```
components/features/
├── admin/
│   ├── RevenueChart.tsx
│   ├── OrdersTable.tsx
│   └── WaiterManagement.tsx
├── booking/
│   ├── BookingForm.tsx
│   └── TableSelector.tsx
└── menu/
    ├── MenuList.tsx
    ├── DishCard.tsx
    └── MenuSearch.tsx
```

---

## 🛠️ Решение проблем

### Проблема 1: Порт 3000 занят

**Симптомы:**
```
⚠ Port 3000 is in use, trying 3001 instead.
```

**Решение:**
```powershell
# Освободите порт 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
  Select-Object -ExpandProperty OwningProcess | 
  ForEach-Object { Stop-Process -Id $_ -Force }

# Перезапустите фронтенд
npm run dev
```

### Проблема 2: Ошибка подключения к БД

**Симптомы:**
```
Npgsql.NpgsqlException: Connection refused
```

**Решение:**
1. Проверьте, что PostgreSQL запущен:
```powershell
Get-Service postgresql*
```

2. Проверьте строку подключения в `appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=restaurant_db;Username=postgres;Password=ВАШ_ПАРОЛЬ"
  }
}
```

3. Создайте базу данных, если её нет:
```sql
CREATE DATABASE restaurant_db;
```

### Проблема 3: CORS ошибки

**Симптомы:**
```
Access to fetch at 'http://localhost:3001/api/menu' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Решение:**
Проверьте `Program.cs` - CORS уже настроена:
```csharp
app.UseCors("AllowFrontend");
```

### Проблема 4: JSON циклические ссылки

**Симптомы:**
```
System.Text.Json.JsonException: A possible object cycle was detected
```

**Решение:**
Уже исправлено в `Program.cs`:
```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
```

### Проблема 5: Миграции не применяются

**Решение:**
```powershell
cd backend\Restaurant.Api

# Удалите старую БД (если нужно)
dotnet ef database drop --project ..\Restaurant.Infrastructure --force

# Примените миграции заново
dotnet ef database update --project ..\Restaurant.Infrastructure
```

---

## 📊 Тестовые данные

### Генерация тестовых данных

```powershell
cd backend\GenerateTestData
dotnet run
```

**Что генерируется:**
- **250 заказов** за последние 90 дней
- **~10 000 000 ₽** суммарная выручка
- **1022 блюда** из 6 категорий
- **16 активных столов** (2-8 мест)
- **Тестовые бронирования**

### Структура данных

#### Категории блюд (6):
1. Закуски
2. Супы
3. Горячие блюда
4. Гарниры
5. Десерты
6. Напитки

#### Пользователи:
| ID | Email | Роль | Пароль |
|----|-------|------|--------|
| 1 | admin@restaurant.com | Admin | admin123 |
| 2 | waiter1@restaurant.com | Waiter | waiter123 |

#### Заказы:
- Распределены равномерно по 90 дням
- Средний чек: **40 000 ₽**
- Статусы: `pending`, `in_progress`, `completed`, `cancelled`

---

## 🎨 Интерфейс системы

### Главная страница (/)
- Приветственная страница
- Кнопки навигации: Меню, Бронирование, Вход

### Меню (/menu)
- Поиск по названию и категориям
- Фильтрация блюд
- AI-рекомендации (DeepSeek)
- Отображение цены, веса, времени приготовления

### Бронирование (/booking)
- Выбор стола (визуализация)
- Выбор даты и времени
- Форма с контактными данными
- Проверка доступности

### Админ-панель (/admin)
#### Dashboard:
- Выручка за сегодня/месяц
- Количество активных заказов
- Активные бронирования
- График выручки (90 дней)

#### Управление заказами (/admin/orders):
- Список всех заказов
- Фильтры по статусу и дате
- Детальная информация о заказе
- Изменение статуса

#### Управление бронированиями (/admin/bookings):
- Все бронирования (активные, завершенные, отмененные)
- Поиск по клиенту и дате
- Подтверждение/отмена бронирований

#### Управление меню (/admin/menu):
- Добавление/редактирование блюд
- Управление категориями
- Изменение цен и доступности

#### AI-инсайты (/admin/ai-insights):
- Рекомендации по меню
- Прогноз спроса
- Анализ популярности блюд

### Панель персонала (/staff)
- Список активных заказов
- Управление заказом (официант)
- История обслуживания

---

## 🔐 Безопасность

### Реализованные меры:
1. **JWT Authentication** (подготовлено в AuthController)
2. **Password Hashing** (bcrypt)
3. **CORS Policy** (ограничение источников)
4. **SQL Injection Protection** (EF Core параметризованные запросы)
5. **XSS Protection** (Next.js автоматическое экранирование)
6. **HTTPS Ready** (настроено для продакшена)

---

## 📈 Мониторинг и логирование

### Hangfire Dashboard
Доступен по адресу: **http://localhost:3001/hangfire**

**Возможности:**
- Просмотр запланированных задач
- История выполнения jobs
- Повторный запуск задач
- Статистика обработки

### Serilog
Логи выводятся в консоль с полной информацией:
```
[01:20:16 INF] HTTP GET /api/menu responded 200 in 7129.4437 ms
[01:20:16 INF] Menu cached with key: menu_all
```

**Обогащение логов:**
- Correlation ID (трассировка запросов)
- Machine Name
- Thread ID
- Environment Name

---

## 🚀 Производительность

### Оптимизации:
1. **Response Compression**: Brotli + Gzip (сжатие 70-80%)
2. **In-Memory Caching**: Меню кэшируется на 15 минут
3. **Query Splitting**: EF Core оптимизация запросов
4. **Hangfire**: Асинхронная обработка тяжелых задач
5. **TanStack Query**: Клиентский кэш API запросов

### Результаты:
- **Загрузка меню**: ~7 сек (первый запрос, 1022 блюда)
- **Загрузка меню (кэш)**: ~100 мс
- **Список заказов**: ~3 сек
- **Бронирование**: ~500 мс

---

## 📞 Поддержка

### Полезные команды

#### Проверка статуса сервисов:
```powershell
# Backend (должен быть на порту 3001)
curl http://localhost:3001/api/menu

# Frontend (должен быть на порту 3000)
curl http://localhost:3000
```

#### Просмотр логов:
```powershell
# Backend логи в консоли
cd backend\Restaurant.Api
dotnet run

# Frontend логи в браузере
F12 → Console
```

#### Очистка и пересборка:
```powershell
# Backend
cd backend\Restaurant.Api
dotnet clean
dotnet build

# Frontend
npm run build
npm run dev
```

---

## 📝 Лицензия

Этот проект создан для образовательных целей в рамках курсовой работы.

---

## 🎯 Итоги реализации

### Выполнено:
✅ Полнофункциональная система управления рестораном  
✅ 13+ Enterprise паттернов в бэкенде  
✅ Clean Architecture с разделением слоев  
✅ Real-time уведомления и фоновые задачи  
✅ AI-интеграция (DeepSeek API)  
✅ Аналитика с 90-дневной историей  
✅ Responsive дизайн (мобильная версия)  
✅ Роли и права доступа  
✅ Comprehensive logging и мониторинг  

### Технические достижения:
- Решена проблема **JSON циклических ссылок** (ReferenceHandler.IgnoreCycles)
- Настроена **CORS политика** для cross-origin запросов
- Исправлены **конфликты маршрутизации** (AmbiguousMatchException)
- Реализован **кэш меню** с автоматическим обновлением
- **Hangfire фоновые задачи**: очистка, отчеты, кэш
- **Компрессия ответов**: Brotli + Gzip
- **Структурированное логирование**: Serilog с Correlation ID

### Масштабируемость:
- Готовность к горизонтальному масштабированию
- Разделение CQRS (команды/запросы)
- Асинхронная обработка (Background Jobs)
- Кэширование на нескольких уровнях

---

**Дата последнего обновления**: 29 октября 2025 г.  
**Версия документа**: 2.0  
**Статус проекта**: ✅ Полностью функционален
