# Backend Implementation Guide

## Содержание
- [Обзор архитектуры](#обзор-архитектуры)
- [Структура базы данных](#структура-базы-данных)
- [Реализация AI функций](#реализация-ai-функций)
- [Интеграция OpenAI](#интеграция-openai)
- [Безопасность и права доступа](#безопасность-и-права-доступа)
- [Кэширование](#кэширование)
- [Мониторинг и логирование](#мониторинг-и-логирование)
- [Тестирование](#тестирование)

---

## Обзор архитектуры

### Технологический стек
- .NET 8 Web API
- PostgreSQL 15+
- Entity Framework Core 8
- OpenAI API (GPT-4 Turbo)
- Redis (для кэширования)
- Hangfire (для фоновых задач)

### Структура проекта

```
backend/
├── Restaurant.Api/              # Web API слой
│   ├── Controllers/
│   │   ├── AiController.cs     # AI endpoints
│   │   ├── AnalyticsController.cs
│   │   └── NotificationsController.cs
│   ├── Middleware/
│   │   ├── ExceptionHandlingMiddleware.cs
│   │   └── RateLimitingMiddleware.cs
│   └── Program.cs
├── Restaurant.Application/       # Бизнес-логика
│   ├── Services/
│   │   ├── AiService.cs
│   │   ├── AnalyticsService.cs
│   │   ├── NotificationService.cs
│   │   └── OpenAiService.cs
│   ├── DTOs/
│   └── Interfaces/
├── Restaurant.Domain/            # Доменные сущности
│   ├── Entities/
│   │   ├── AiRequest.cs
│   │   ├── DishForecast.cs
│   │   ├── Notification.cs
│   │   └── ...
│   └── Enums/
└── Restaurant.Infrastructure/    # Инфраструктура
    ├── Persistence/
    │   ├── ApplicationDbContext.cs
    │   └── Repositories/
    └── External/
        └── OpenAiClient.cs
```

---

## Структура базы данных

### Применение миграций

```bash
# Применить SQL миграцию
psql -U postgres -d restaurant_db -f migrations/002_ai_analytics.sql

# Или через EF Core
dotnet ef database update
```

### Ключевые таблицы

#### AiRequests
Хранит историю всех AI запросов для аудита и анализа.

```sql
CREATE TABLE AiRequests (
    Id SERIAL PRIMARY KEY,
    Type VARCHAR(50) NOT NULL,  -- 'digest', 'forecast', 'recommendation', 'chat'
    RequestData JSONB NOT NULL,
    ResponseData JSONB,
    ProcessingTimeMs INTEGER,
    TokensUsed INTEGER,
    Cost DECIMAL(10, 4),
    UserId INTEGER NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

CREATE INDEX idx_ai_requests_type_date ON AiRequests(Type, CreatedAt);
CREATE INDEX idx_ai_requests_user ON AiRequests(UserId);
```

#### DailyDigests
```sql
CREATE TABLE DailyDigests (
    Id SERIAL PRIMARY KEY,
    PeriodStart TIMESTAMP NOT NULL,
    PeriodEnd TIMESTAMP NOT NULL,
    Summary TEXT NOT NULL,
    KeyInsights JSONB,
    Recommendations JSONB,
    Metrics JSONB,
    GeneratedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_digests_period ON DailyDigests(PeriodStart, PeriodEnd);
```

#### Notifications
```sql
CREATE TABLE Notifications (
    Id SERIAL PRIMARY KEY,
    UserId INTEGER NOT NULL,
    Type VARCHAR(50) NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Message TEXT NOT NULL,
    Priority VARCHAR(20) DEFAULT 'medium',
    IsRead BOOLEAN DEFAULT FALSE,
    ActionUrl VARCHAR(500),
    Metadata JSONB,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ReadAt TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

CREATE INDEX idx_notifications_user_read ON Notifications(UserId, IsRead);
CREATE INDEX idx_notifications_created ON Notifications(CreatedAt DESC);
```

---

## Реализация AI функций

### 1. AiService.cs

```csharp
using Restaurant.Application.DTOs;
using Restaurant.Application.Interfaces;
using Restaurant.Domain.Entities;
using System.Diagnostics;

namespace Restaurant.Application.Services
{
    public class AiService : IAiService
    {
        private readonly IOpenAiService _openAiService;
        private readonly IAnalyticsService _analyticsService;
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<AiService> _logger;

        public AiService(
            IOpenAiService openAiService,
            IAnalyticsService analyticsService,
            INotificationService notificationService,
            IUnitOfWork unitOfWork,
            ILogger<AiService> logger)
        {
            _openAiService = openAiService;
            _analyticsService = analyticsService;
            _notificationService = notificationService;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<AiDigestResponse> GenerateDigestAsync(
            AiDigestRequest request, 
            int userId)
        {
            var stopwatch = Stopwatch.StartNew();
            
            try
            {
                // 1. Собрать данные из БД
                var metrics = await _analyticsService.GetDashboardAsync(
                    request.PeriodStart, 
                    request.PeriodEnd);

                // 2. Подготовить промпт для OpenAI
                var prompt = BuildDigestPrompt(metrics);

                // 3. Получить AI-анализ
                var aiResponse = await _openAiService.GenerateCompletionAsync(
                    prompt,
                    maxTokens: 1500);

                // 4. Создать рекомендации, если требуется
                List<AiRecommendation> recommendations = null;
                if (request.IncludeRecommendations)
                {
                    recommendations = await GenerateRecommendationsAsync(metrics);
                }

                // 5. Сохранить дайджест в БД
                var digest = new DailyDigest
                {
                    PeriodStart = request.PeriodStart,
                    PeriodEnd = request.PeriodEnd,
                    Summary = aiResponse.Content,
                    KeyInsights = ExtractKeyInsights(aiResponse.Content),
                    Recommendations = recommendations,
                    Metrics = metrics,
                    GeneratedAt = DateTime.UtcNow
                };

                await _unitOfWork.Digests.AddAsync(digest);
                await _unitOfWork.SaveChangesAsync();

                // 6. Логировать запрос
                stopwatch.Stop();
                await LogAiRequestAsync(
                    "digest",
                    request,
                    digest,
                    aiResponse.TokensUsed,
                    stopwatch.ElapsedMilliseconds,
                    userId);

                // 7. Отправить уведомления
                if (recommendations?.Any(r => r.Priority == "high") == true)
                {
                    await _notificationService.CreateAsync(new NotificationDto
                    {
                        Type = "ai_insight",
                        Title = "Новый AI-дайджест с важными рекомендациями",
                        Message = $"Сгенерирован дайджест за {request.PeriodStart:dd.MM.yyyy}",
                        Priority = "high",
                        ActionUrl = "/admin/ai-insights"
                    }, userId);
                }

                return MapToDigestResponse(digest);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating AI digest");
                throw;
            }
        }

        public async Task<AiForecastResponse> GenerateForecastAsync(
            AiForecastRequest request, 
            int userId)
        {
            var stopwatch = Stopwatch.StartNew();

            try
            {
                // 1. Получить исторические данные
                var historicalData = await _analyticsService.GetDishHistoryAsync(
                    request.DishIds,
                    DateTime.Now.AddMonths(-3),
                    DateTime.Now);

                // 2. Подготовить промпт с историческими данными
                var prompt = BuildForecastPrompt(historicalData, request);

                // 3. Получить прогноз от AI
                var aiResponse = await _openAiService.GenerateCompletionAsync(
                    prompt,
                    maxTokens: 2000);

                // 4. Парсить и валидировать прогноз
                var forecasts = ParseForecastResponse(aiResponse.Content);

                // 5. Сохранить прогнозы в БД
                foreach (var forecast in forecasts)
                {
                    var dishForecast = new DishForecast
                    {
                        DishId = forecast.DishId,
                        ForecastDate = request.StartDate,
                        PredictedQuantity = forecast.ForecastedQuantity,
                        ConfidenceLow = forecast.ConfidenceLow,
                        ConfidenceHigh = forecast.ConfidenceHigh,
                        Factors = forecast.Factors,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _unitOfWork.Forecasts.AddAsync(dishForecast);
                }

                await _unitOfWork.SaveChangesAsync();

                // 6. Логирование
                stopwatch.Stop();
                await LogAiRequestAsync(
                    "forecast",
                    request,
                    forecasts,
                    aiResponse.TokensUsed,
                    stopwatch.ElapsedMilliseconds,
                    userId);

                return new AiForecastResponse
                {
                    Forecasts = forecasts,
                    Period = new PeriodDto 
                    { 
                        Start = request.StartDate, 
                        End = request.EndDate 
                    },
                    GeneratedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating forecast");
                throw;
            }
        }

        public async Task<List<AiRecommendation>> GetRecommendationsAsync(
            string type = null, 
            string priority = null, 
            int limit = 10)
        {
            var query = _unitOfWork.Recommendations
                .GetQueryable()
                .Where(r => r.ValidUntil > DateTime.UtcNow);

            if (!string.IsNullOrEmpty(type))
                query = query.Where(r => r.Type == type);

            if (!string.IsNullOrEmpty(priority))
                query = query.Where(r => r.Priority == priority);

            var recommendations = await query
                .OrderByDescending(r => r.Priority == "high" ? 3 : r.Priority == "medium" ? 2 : 1)
                .ThenByDescending(r => r.Confidence)
                .Take(limit)
                .ToListAsync();

            return recommendations.Select(MapToRecommendationDto).ToList();
        }

        public async Task<AiChatResponse> ChatAsync(AiChatRequest request, int userId)
        {
            var stopwatch = Stopwatch.StartNew();

            try
            {
                // 1. Получить контекст разговора
                var conversationHistory = await GetConversationHistoryAsync(
                    request.Context?.SessionId);

                // 2. Собрать системный промпт с контекстом ресторана
                var systemPrompt = await BuildSystemPromptAsync();

                // 3. Отправить в OpenAI
                var messages = new List<OpenAiMessage>
                {
                    new OpenAiMessage { Role = "system", Content = systemPrompt }
                };
                
                messages.AddRange(conversationHistory);
                messages.Add(new OpenAiMessage 
                { 
                    Role = "user", 
                    Content = request.Message 
                });

                var aiResponse = await _openAiService.GenerateChatCompletionAsync(
                    messages,
                    maxTokens: 500);

                // 4. Сохранить сообщения
                await SaveChatMessagesAsync(
                    request.Context?.SessionId,
                    request.Message,
                    aiResponse.Content,
                    userId);

                // 5. Генерировать подсказки
                var suggestions = GenerateSuggestions(aiResponse.Content, request.Message);

                // 6. Логирование
                stopwatch.Stop();
                await LogAiRequestAsync(
                    "chat",
                    request,
                    aiResponse.Content,
                    aiResponse.TokensUsed,
                    stopwatch.ElapsedMilliseconds,
                    userId);

                return new AiChatResponse
                {
                    Response = aiResponse.Content,
                    Suggestions = suggestions,
                    Metadata = new AiChatMetadata
                    {
                        ProcessingTimeMs = (int)stopwatch.ElapsedMilliseconds,
                        Model = "gpt-4-turbo",
                        TokensUsed = aiResponse.TokensUsed
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AI chat");
                throw;
            }
        }

        // Helper methods
        private string BuildDigestPrompt(AnalyticsDashboard metrics)
        {
            return $@"
Вы - AI-аналитик ресторанной системы. Проанализируйте следующие данные и предоставьте краткий дайджест:

Выручка: {metrics.Revenue.Total:N0}₽ (рост {metrics.Revenue.GrowthRate:F1}%)
Заказы: {metrics.Orders.Total} (средний чек {metrics.Orders.AverageCheck:N0}₽)
Популярные блюда:
{string.Join("\n", metrics.Menu.TopDishes.Take(5).Select(d => $"- {d.Name}: {d.OrdersCount} заказов"))}

Сформулируйте:
1. Краткое резюме (2-3 предложения)
2. 3-5 ключевых инсайтов
3. Рекомендации по улучшению (если есть проблемы)

Формат ответа - структурированный текст на русском языке.
";
        }

        private async Task LogAiRequestAsync(
            string type,
            object requestData,
            object responseData,
            int tokensUsed,
            long processingTimeMs,
            int userId)
        {
            var aiRequest = new AiRequest
            {
                Type = type,
                RequestData = JsonSerializer.Serialize(requestData),
                ResponseData = JsonSerializer.Serialize(responseData),
                TokensUsed = tokensUsed,
                ProcessingTimeMs = (int)processingTimeMs,
                Cost = CalculateCost(tokensUsed),
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.AiRequests.AddAsync(aiRequest);
            await _unitOfWork.SaveChangesAsync();
        }

        private decimal CalculateCost(int tokens)
        {
            // GPT-4 Turbo pricing: $0.01 per 1K input tokens, $0.03 per 1K output tokens
            // Simplified: average $0.02 per 1K tokens
            return (decimal)tokens / 1000 * 0.02m;
        }
    }
}
```

---

## Интеграция OpenAI

### OpenAiService.cs

```csharp
using OpenAI.Chat;
using System.ClientModel;

namespace Restaurant.Application.Services
{
    public class OpenAiService : IOpenAiService
    {
        private readonly ChatClient _chatClient;
        private readonly ILogger<OpenAiService> _logger;
        private readonly string _model = "gpt-4-turbo-preview";

        public OpenAiService(IConfiguration configuration, ILogger<OpenAiService> logger)
        {
            var apiKey = configuration["OpenAI:ApiKey"];
            _chatClient = new ChatClient(_model, new ApiKeyCredential(apiKey));
            _logger = logger;
        }

        public async Task<OpenAiResponse> GenerateChatCompletionAsync(
            List<OpenAiMessage> messages,
            int maxTokens = 1000,
            float temperature = 0.7f)
        {
            try
            {
                var chatMessages = messages.Select(m => 
                    m.Role == "system" 
                        ? ChatMessage.CreateSystemMessage(m.Content)
                        : m.Role == "assistant"
                            ? ChatMessage.CreateAssistantMessage(m.Content)
                            : ChatMessage.CreateUserMessage(m.Content)
                ).ToList();

                var options = new ChatCompletionOptions
                {
                    MaxTokens = maxTokens,
                    Temperature = temperature
                };

                var completion = await _chatClient.CompleteChatAsync(chatMessages, options);
                
                return new OpenAiResponse
                {
                    Content = completion.Value.Content[0].Text,
                    TokensUsed = completion.Value.Usage.TotalTokens,
                    Model = _model
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling OpenAI API");
                throw new ExternalServiceException("Failed to generate AI response", ex);
            }
        }

        public async Task<OpenAiResponse> GenerateCompletionAsync(
            string prompt,
            int maxTokens = 1000,
            float temperature = 0.7f)
        {
            var messages = new List<OpenAiMessage>
            {
                new OpenAiMessage { Role = "user", Content = prompt }
            };

            return await GenerateChatCompletionAsync(messages, maxTokens, temperature);
        }
    }
}
```

### Конфигурация (appsettings.json)

```json
{
  "OpenAI": {
    "ApiKey": "sk-your-api-key-here",
    "Model": "gpt-4-turbo-preview",
    "MaxTokens": 2000,
    "Temperature": 0.7
  },
  "RateLimiting": {
    "Ai": {
      "RequestsPerMinute": 10
    },
    "Analytics": {
      "RequestsPerMinute": 30
    }
  }
}
```

---

## Безопасность и права доступа

### Authorization Policies

```csharp
// Program.cs
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy => 
        policy.RequireRole("admin"));
    
    options.AddPolicy("RequireManagerRole", policy => 
        policy.RequireRole("admin", "manager"));
    
    options.AddPolicy("RequireStaffRole", policy => 
        policy.RequireRole("admin", "manager", "waiter"));
});
```

### Controller Authorization

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequireManagerRole")]
public class AiController : ControllerBase
{
    [HttpPost("digest")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<ActionResult<AiDigestResponse>> GenerateDigest(
        [FromBody] AiDigestRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
        var result = await _aiService.GenerateDigestAsync(request, userId);
        return Ok(result);
    }

    [HttpPost("chat")]
    public async Task<ActionResult<AiChatResponse>> Chat(
        [FromBody] AiChatRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
        var result = await _aiService.ChatAsync(request, userId);
        return Ok(result);
    }
}
```

---

## Кэширование

### Redis Integration

```csharp
// Program.cs
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "Restaurant_";
});

// CachedAnalyticsService.cs
public class CachedAnalyticsService : IAnalyticsService
{
    private readonly IAnalyticsService _innerService;
    private readonly IDistributedCache _cache;

    public async Task<AnalyticsDashboard> GetDashboardAsync(
        DateTime startDate, 
        DateTime endDate)
    {
        var cacheKey = $"dashboard_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";
        
        var cached = await _cache.GetStringAsync(cacheKey);
        if (cached != null)
        {
            return JsonSerializer.Deserialize<AnalyticsDashboard>(cached);
        }

        var result = await _innerService.GetDashboardAsync(startDate, endDate);
        
        await _cache.SetStringAsync(
            cacheKey,
            JsonSerializer.Serialize(result),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            });

        return result;
    }
}
```

---

## Мониторинг и логирование

### Structured Logging

```csharp
_logger.LogInformation(
    "AI digest generated. Period: {PeriodStart} - {PeriodEnd}, Tokens: {Tokens}, Duration: {Duration}ms",
    request.PeriodStart,
    request.PeriodEnd,
    tokensUsed,
    stopwatch.ElapsedMilliseconds);

_logger.LogWarning(
    "High-priority recommendation created: {Type}, Confidence: {Confidence}",
    recommendation.Type,
    recommendation.Confidence);

_logger.LogError(
    exception,
    "Failed to generate forecast for dishes: {DishIds}",
    string.Join(", ", request.DishIds));
```

### Health Checks

```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection"))
    .AddRedis(builder.Configuration.GetConnectionString("Redis"))
    .AddCheck<OpenAiHealthCheck>("openai");

app.MapHealthChecks("/health");
```

---

## Тестирование

### Unit Tests Example

```csharp
[Fact]
public async Task GenerateDigest_ValidRequest_ReturnsDigest()
{
    // Arrange
    var mockOpenAi = new Mock<IOpenAiService>();
    mockOpenAi
        .Setup(x => x.GenerateCompletionAsync(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<float>()))
        .ReturnsAsync(new OpenAiResponse 
        { 
            Content = "Test digest", 
            TokensUsed = 100 
        });

    var service = new AiService(
        mockOpenAi.Object,
        Mock.Of<IAnalyticsService>(),
        Mock.Of<INotificationService>(),
        Mock.Of<IUnitOfWork>(),
        Mock.Of<ILogger<AiService>>());

    var request = new AiDigestRequest
    {
        PeriodStart = DateTime.UtcNow.AddDays(-1),
        PeriodEnd = DateTime.UtcNow
    };

    // Act
    var result = await service.GenerateDigestAsync(request, 1);

    // Assert
    Assert.NotNull(result);
    Assert.Contains("Test digest", result.Summary);
}
```

---

## Deployment Checklist

- [ ] Применить SQL миграции
- [ ] Настроить OpenAI API ключ
- [ ] Настроить Redis для кэширования
- [ ] Настроить Hangfire для фоновых задач
- [ ] Установить rate limiting
- [ ] Настроить логирование (Serilog + ELK)
- [ ] Настроить мониторинг (Application Insights)
- [ ] Протестировать все AI endpoints
- [ ] Настроить backup базы данных
- [ ] Проверить security policies

---

## Полезные команды

```bash
# Создать миграцию
dotnet ef migrations add AddAiAnalytics

# Применить миграции
dotnet ef database update

# Запустить проект
dotnet run --project Restaurant.Api

# Запустить тесты
dotnet test

# Собрать для production
dotnet publish -c Release -o ./publish
```
