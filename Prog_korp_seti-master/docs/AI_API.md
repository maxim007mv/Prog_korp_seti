# AI & Analytics API Documentation

## Содержание
- [Обзор](#обзор)
- [Аутентификация](#аутентификация)
- [AI Endpoints](#ai-endpoints)
- [Analytics Endpoints](#analytics-endpoints)
- [Notifications Endpoints](#notifications-endpoints)
- [Модели данных](#модели-данных)
- [Коды ошибок](#коды-ошибок)

---

## Обзор

REST API для AI-возможностей и аналитики ресторанной системы. Базовый URL: `/api/v1`

### Версионирование
- Текущая версия: `v1`
- API версионируется через URL path

### Форматы данных
- Request: `application/json`
- Response: `application/json`
- Date/Time: ISO 8601 (UTC)

---

## Аутентификация

Все запросы требуют JWT токена в заголовке:

```http
Authorization: Bearer <jwt_token>
```

### Роли доступа
- `admin` - полный доступ ко всем endpoints
- `manager` - доступ к аналитике и отчётам
- `waiter` - ограниченный доступ к AI рекомендациям

---

## AI Endpoints

### 1. Генерация дневного дайджеста

Генерирует AI-дайджест за указанный период.

**Endpoint:** `POST /api/ai/digest`

**Права доступа:** `admin`, `manager`

**Request Body:**
```json
{
  "periodStart": "2024-01-15T00:00:00Z",
  "periodEnd": "2024-01-15T23:59:59Z",
  "includeRecommendations": true,
  "includeForecast": true
}
```

**Response:** `200 OK`
```json
{
  "id": 123,
  "periodStart": "2024-01-15T00:00:00Z",
  "periodEnd": "2024-01-15T23:59:59Z",
  "summary": "Сегодня зарегистрировано 45 заказов на сумму 67,500₽...",
  "keyInsights": [
    "Рост продаж на 15% по сравнению с прошлой неделей",
    "Пицца Маргарита - самое популярное блюдо дня"
  ],
  "recommendations": [
    {
      "type": "menu_optimization",
      "priority": "high",
      "title": "Увеличить количество ингредиентов для Пиццы",
      "description": "Прогнозируется повышенный спрос..."
    }
  ],
  "metrics": {
    "totalRevenue": 67500,
    "totalOrders": 45,
    "averageCheck": 1500,
    "popularDishes": [
      {
        "dishId": 5,
        "dishName": "Пицца Маргарита",
        "ordersCount": 12,
        "revenue": 8400
      }
    ]
  },
  "generatedAt": "2024-01-16T08:00:00Z"
}
```

---

### 2. Получить последний дайджест

**Endpoint:** `GET /api/ai/digest/latest`

**Права доступа:** `admin`, `manager`

**Response:** `200 OK`
```json
{
  "id": 123,
  "periodStart": "2024-01-15T00:00:00Z",
  "periodEnd": "2024-01-15T23:59:59Z",
  "summary": "...",
  "keyInsights": [...],
  "recommendations": [...],
  "metrics": {...},
  "generatedAt": "2024-01-16T08:00:00Z"
}
```

---

### 3. Прогноз спроса

Прогнозирует спрос на блюда на указанный период.

**Endpoint:** `POST /api/ai/forecast`

**Права доступа:** `admin`, `manager`

**Request Body:**
```json
{
  "startDate": "2024-01-20T00:00:00Z",
  "endDate": "2024-01-27T00:00:00Z",
  "dishIds": [1, 2, 5, 10],
  "includeConfidenceInterval": true
}
```

**Response:** `200 OK`
```json
{
  "forecasts": [
    {
      "dishId": 5,
      "dishName": "Пицца Маргарита",
      "forecastedQuantity": 85,
      "confidenceLow": 75,
      "confidenceHigh": 95,
      "trend": "increasing",
      "factors": [
        "Исторически высокий спрос по выходным",
        "Положительные отзывы клиентов"
      ]
    }
  ],
  "period": {
    "start": "2024-01-20T00:00:00Z",
    "end": "2024-01-27T00:00:00Z"
  },
  "generatedAt": "2024-01-16T10:00:00Z"
}
```

---

### 4. Получить рекомендации

**Endpoint:** `GET /api/ai/recommendations`

**Query Parameters:**
- `type` (optional): `menu_optimization | staff_scheduling | inventory_management | pricing_strategy | marketing`
- `priority` (optional): `low | medium | high`
- `limit` (optional): number, default 10

**Права доступа:** `admin`, `manager`

**Response:** `200 OK`
```json
{
  "recommendations": [
    {
      "id": 45,
      "type": "menu_optimization",
      "priority": "high",
      "title": "Оптимизация меню: удалить неходовые позиции",
      "description": "Блюда с ID [23, 34] показывают низкий спрос...",
      "actionItems": [
        "Рассмотреть замену блюд",
        "Провести опрос клиентов"
      ],
      "expectedImpact": "Увеличение оборота на 8-12%",
      "confidence": 0.87,
      "createdAt": "2024-01-16T09:00:00Z",
      "validUntil": "2024-01-30T00:00:00Z"
    }
  ],
  "total": 15,
  "page": 1
}
```

---

### 5. AI Chat

Интерактивный чат с AI-помощником.

**Endpoint:** `POST /api/ai/chat`

**Права доступа:** `admin`, `manager`, `waiter`

**Request Body:**
```json
{
  "message": "Какие блюда сегодня самые популярные?",
  "context": {
    "sessionId": "uuid-session-id",
    "userId": 42
  }
}
```

**Response:** `200 OK`
```json
{
  "response": "Сегодня самые популярные блюда:\n1. Пицца Маргарита (12 заказов)\n2. Паста Карбонара (8 заказов)\n3. Цезарь с курицей (7 заказов)",
  "suggestions": [
    "Показать прогноз на завтра",
    "Какие ингредиенты заканчиваются?",
    "Статистика по официантам"
  ],
  "metadata": {
    "processingTimeMs": 850,
    "model": "gpt-4-turbo",
    "tokensUsed": 245
  }
}
```

---

### 6. История AI запросов

**Endpoint:** `GET /api/ai/history`

**Query Parameters:**
- `type` (optional): `digest | forecast | recommendation | chat`
- `startDate` (optional): ISO 8601
- `endDate` (optional): ISO 8601
- `limit` (optional): number, default 50

**Права доступа:** `admin`

**Response:** `200 OK`
```json
{
  "history": [
    {
      "id": 234,
      "type": "forecast",
      "requestData": {...},
      "responseData": {...},
      "processingTimeMs": 1200,
      "tokensUsed": 450,
      "cost": 0.023,
      "userId": 42,
      "userName": "Иван Петров",
      "createdAt": "2024-01-16T10:30:00Z"
    }
  ],
  "total": 156,
  "page": 1
}
```

---

### 7. AI Статистика

**Endpoint:** `GET /api/ai/stats`

**Query Parameters:**
- `startDate` (optional): ISO 8601
- `endDate` (optional): ISO 8601

**Права доступа:** `admin`

**Response:** `200 OK`
```json
{
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-16T23:59:59Z"
  },
  "totalRequests": 1234,
  "requestsByType": {
    "digest": 16,
    "forecast": 45,
    "recommendation": 234,
    "chat": 939
  },
  "totalTokensUsed": 1234567,
  "totalCost": 123.45,
  "averageResponseTime": 890,
  "successRate": 0.987
}
```

---

## Analytics Endpoints

### 1. Основная аналитическая панель

**Endpoint:** `GET /api/analytics/dashboard`

**Query Parameters:**
- `startDate`: ISO 8601
- `endDate`: ISO 8601

**Права доступа:** `admin`, `manager`

**Response:** `200 OK`
```json
{
  "revenue": {
    "total": 456789,
    "byDay": [...],
    "byCategory": {...},
    "trend": "increasing",
    "growthRate": 12.5
  },
  "orders": {
    "total": 1234,
    "completed": 1200,
    "cancelled": 34,
    "averageCheck": 370,
    "peakHours": [18, 19, 20]
  },
  "menu": {
    "topDishes": [...],
    "lowPerformers": [...],
    "categoryPerformance": [...]
  },
  "staff": {
    "totalServed": 1234,
    "averageRating": 4.6,
    "topWaiters": [...]
  },
  "customers": {
    "new": 156,
    "returning": 890,
    "retentionRate": 0.85
  },
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-16T23:59:59Z"
  }
}
```

---

### 2. Производительность меню

**Endpoint:** `GET /api/analytics/menu/performance`

**Query Parameters:**
- `startDate`: ISO 8601
- `endDate`: ISO 8601
- `categoryId` (optional): number

**Права доступа:** `admin`, `manager`

**Response:** `200 OK`
```json
{
  "dishes": [
    {
      "id": 5,
      "name": "Пицца Маргарита",
      "category": "Пицца",
      "totalOrders": 234,
      "revenue": 32760,
      "averageRating": 4.8,
      "profitMargin": 0.68,
      "popularityRank": 1,
      "trend": "stable"
    }
  ],
  "categories": [
    {
      "id": 2,
      "name": "Пицца",
      "totalOrders": 456,
      "revenue": 63840,
      "shareOfTotal": 0.34
    }
  ]
}
```

---

### 3. Метрики персонала

**Endpoint:** `GET /api/analytics/staff/metrics`

**Query Parameters:**
- `startDate`: ISO 8601
- `endDate`: ISO 8601
- `staffId` (optional): number

**Права доступа:** `admin`, `manager`

**Response:** `200 OK`
```json
{
  "staff": [
    {
      "id": 15,
      "name": "Иван Петров",
      "role": "waiter",
      "ordersServed": 145,
      "revenue": 54000,
      "averageCheck": 372,
      "averageRating": 4.7,
      "tips": 8500,
      "performance": "excellent"
    }
  ],
  "summary": {
    "totalStaff": 12,
    "averageOrdersPerStaff": 102,
    "totalRevenue": 648000
  }
}
```

---

### 4. Экспорт данных

**Endpoint:** `GET /api/analytics/export`

**Query Parameters:**
- `type`: `orders | revenue | menu | staff | customers`
- `format`: `csv | excel | pdf`
- `startDate`: ISO 8601
- `endDate`: ISO 8601

**Права доступа:** `admin`, `manager`

**Response:** `200 OK`
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="orders_2024-01-16.csv"

[Binary file data]
```

---

### 5. Системные метрики

**Endpoint:** `GET /api/analytics/system/metrics`

**Права доступа:** `admin`

**Response:** `200 OK`
```json
{
  "database": {
    "size": "2.4 GB",
    "connections": 12,
    "queryPerformance": {
      "average": 45,
      "p95": 120,
      "p99": 250
    }
  },
  "api": {
    "requestsPerMinute": 234,
    "averageResponseTime": 89,
    "errorRate": 0.002
  },
  "cache": {
    "hitRate": 0.92,
    "size": "512 MB",
    "evictions": 145
  },
  "uptime": 2592000,
  "health": "healthy"
}
```

---

## Notifications Endpoints

### 1. Получить уведомления

**Endpoint:** `GET /api/notifications`

**Query Parameters:**
- `isRead` (optional): boolean
- `type` (optional): `info | warning | error | success | ai_insight`
- `limit` (optional): number, default 20

**Права доступа:** authenticated user

**Response:** `200 OK`
```json
[
  {
    "id": 123,
    "userId": 42,
    "type": "ai_insight",
    "title": "Новая рекомендация от AI",
    "message": "Обнаружен тренд: увеличение спроса на вегетарианские блюда",
    "priority": "high",
    "isRead": false,
    "actionUrl": "/admin/ai-insights",
    "metadata": {
      "recommendationId": 45
    },
    "createdAt": "2024-01-16T10:00:00Z",
    "readAt": null
  }
]
```

---

### 2. Получить непрочитанные

**Endpoint:** `GET /api/notifications/unread`

**Права доступа:** authenticated user

**Response:** `200 OK`
```json
[
  {
    "id": 123,
    "type": "ai_insight",
    "title": "Новая рекомендация от AI",
    "message": "...",
    "priority": "high",
    "createdAt": "2024-01-16T10:00:00Z"
  }
]
```

---

### 3. Пометить как прочитанное

**Endpoint:** `PUT /api/notifications/{id}/read`

**Права доступа:** authenticated user (own notifications only)

**Response:** `200 OK`
```json
{
  "id": 123,
  "isRead": true,
  "readAt": "2024-01-16T11:30:00Z"
}
```

---

### 4. Пометить все как прочитанные

**Endpoint:** `PUT /api/notifications/read-all`

**Права доступа:** authenticated user

**Response:** `204 No Content`

---

### 5. Удалить уведомление

**Endpoint:** `DELETE /api/notifications/{id}`

**Права доступа:** authenticated user (own notifications only)

**Response:** `204 No Content`

---

### 6. Статистика уведомлений

**Endpoint:** `GET /api/notifications/stats`

**Права доступа:** authenticated user

**Response:** `200 OK`
```json
{
  "total": 45,
  "unread": 8,
  "byType": {
    "info": 20,
    "warning": 10,
    "error": 2,
    "success": 8,
    "ai_insight": 5
  },
  "byPriority": {
    "low": 25,
    "medium": 15,
    "high": 5
  }
}
```

---

## Модели данных

### AiDigestResponse
```typescript
interface AiDigestResponse {
  id: number;
  periodStart: string; // ISO 8601
  periodEnd: string;
  summary: string;
  keyInsights: string[];
  recommendations: AiRecommendation[];
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    averageCheck: number;
    popularDishes: PopularDish[];
  };
  generatedAt: string;
}
```

### AiRecommendation
```typescript
interface AiRecommendation {
  id: number;
  type: 'menu_optimization' | 'staff_scheduling' | 'inventory_management' | 'pricing_strategy' | 'marketing';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actionItems: string[];
  expectedImpact: string;
  confidence: number; // 0-1
  createdAt: string;
  validUntil: string;
}
```

### Notification
```typescript
interface Notification {
  id: number;
  userId: number;
  type: 'info' | 'warning' | 'error' | 'success' | 'ai_insight';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}
```

---

## Коды ошибок

### HTTP Status Codes

- `200 OK` - Запрос успешно выполнен
- `201 Created` - Ресурс успешно создан
- `204 No Content` - Запрос успешен, ответ без содержимого
- `400 Bad Request` - Некорректные параметры запроса
- `401 Unauthorized` - Отсутствует или неверный токен аутентификации
- `403 Forbidden` - Недостаточно прав доступа
- `404 Not Found` - Ресурс не найден
- `422 Unprocessable Entity` - Ошибка валидации данных
- `429 Too Many Requests` - Превышен лимит запросов
- `500 Internal Server Error` - Внутренняя ошибка сервера
- `503 Service Unavailable` - Сервис временно недоступен

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "startDate",
        "message": "Must be a valid ISO 8601 date"
      }
    ],
    "timestamp": "2024-01-16T12:00:00Z",
    "requestId": "req_abc123"
  }
}
```

### Error Codes

- `AUTH_REQUIRED` - Требуется аутентификация
- `INSUFFICIENT_PERMISSIONS` - Недостаточно прав
- `VALIDATION_ERROR` - Ошибка валидации
- `RESOURCE_NOT_FOUND` - Ресурс не найден
- `RATE_LIMIT_EXCEEDED` - Превышен лимит запросов
- `AI_SERVICE_ERROR` - Ошибка AI сервиса
- `DATABASE_ERROR` - Ошибка базы данных
- `EXTERNAL_SERVICE_ERROR` - Ошибка внешнего сервиса

---

## Rate Limiting

API использует rate limiting для предотвращения злоупотреблений:

- **AI Endpoints**: 10 запросов/минуту
- **Analytics Endpoints**: 30 запросов/минуту
- **Notifications Endpoints**: 60 запросов/минуту

Headers в ответе:
```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1705406400
```

---

## Webhook Events

Система может отправлять webhook уведомления на настроенные URL.

### Event Types
- `ai.digest.generated` - Сгенерирован новый дайджест
- `ai.recommendation.created` - Создана новая рекомендация
- `ai.recommendation.expired` - Рекомендация истекла
- `notification.created` - Создано новое уведомление

### Payload Example
```json
{
  "event": "ai.recommendation.created",
  "timestamp": "2024-01-16T10:00:00Z",
  "data": {
    "recommendationId": 45,
    "type": "menu_optimization",
    "priority": "high"
  }
}
```

---

## Changelog

### v1.0.0 (2024-01-16)
- Initial API release
- AI digest, forecast, recommendations
- Analytics dashboard and reports
- Notification system
- Export functionality

---

## Support

Для технической поддержки:
- Email: api-support@restaurant.com
- Документация: https://docs.restaurant.com/api
- Status Page: https://status.restaurant.com
