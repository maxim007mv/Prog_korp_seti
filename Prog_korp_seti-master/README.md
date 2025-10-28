# Restaurant Management System - AI-Powered Platform

Полноценная интеллектуальная система управления рестораном с интеграцией искусственного интеллекта. Система включает три зоны: публичная часть (Client), официанты (Staff) и администрирование с AI-аналитикой (Admin).

## 🚀 Ключевые возможности

### 🤖 AI-возможности
- **Автоматические дайджесты** - ежедневные AI-отчёты о работе ресторана
- **Прогнозирование спроса** - предсказание популярности блюд
- **Интеллектуальные рекомендации** - советы по оптимизации меню, персонала, ценообразованию
- **AI-чат ассистент** - интерактивный помощник для менеджеров
- **Анализ трендов** - выявление паттернов в поведении клиентов

### 📊 Аналитика
- Полная панель бизнес-метрик в реальном времени
- Производительность меню и категорий
- Метрики эффективности персонала
- Экспорт данных (CSV, Excel, PDF)
- Системный мониторинг и health checks

### 🔔 Уведомления
- Real-time уведомления о важных событиях
- Интеграция с AI-инсайтами
- Приоритезация по важности
- История всех уведомлений

## Технологии

### Frontend
- **Next.js 14** (App Router)
- **React 18** с TypeScript
- **TailwindCSS** для стилизации
- **TanStack Query v5** для управления данными
- **Framer Motion** для анимаций
- **Recharts** для графиков и аналитики
- **Zod** для валидации

### Backend
- **.NET 8 Web API** с Clean Architecture
- **Entity Framework Core** для ORM
- **PostgreSQL 15+** с расширениями для AI
- **DeepSeek AI API** для AI-функций
- **JWT** для аутентификации
- **Swagger** для API документации

## Структура проекта

```
├── app/                    # Next.js App Router страницы
│   ├── (public)/          # Публичные маршруты (/, /menu, /booking)
│   ├── staff/             # Маршруты для официантов
│   ├── admin/             # Админ-панель с AI-аналитикой
│   └── login/             # Аутентификация
├── components/            # React компоненты
│   ├── features/          # Feature-based компоненты
│   └── ui/                # UI компоненты
├── lib/                   # Утилиты и API
│   ├── api/               # API клиент и endpoints
│   ├── hooks/             # React Query хуки
│   └── ai/                # AI интеграция
├── types/                 # TypeScript типы
└── backend/               # .NET 8 backend
    ├── Restaurant.Api/         # Web API контроллеры
    ├── Restaurant.Domain/      # Domain entities и бизнес-логика
    └── Restaurant.Infrastructure/ # EF Core и persistence
```

## 🚀 Быстрый запуск

### Предварительные требования
- **Node.js 18+**
- **.NET 8 SDK**
- **PostgreSQL 15+**
- **Git**

### 1. Клонирование репозитория
```bash
git clone https://github.com/maxim007mv/Prog_korp_seti.git
cd Prog_korp_seti
```

### 2. Настройка базы данных
```bash
# Создайте базу данных PostgreSQL
createdb restaurant_db

# Или через psql:
# psql -U postgres -c "CREATE DATABASE restaurant_db;"
```

### 3. Backend (.NET)
```bash
cd backend/Restaurant.Api

# Примените миграции EF Core
dotnet ef database update --project ../Restaurant.Infrastructure --startup-project .

# Запустите backend
dotnet run
```
Backend будет доступен на `http://localhost:3001`

### 4. Frontend (Next.js)
```bash
# В корне проекта
npm install

# Запустите frontend
npm run dev
```
Frontend будет доступен на `http://localhost:3000`

### 5. Генерация тестовых данных (опционально)
```bash
cd backend/GenerateTestData
dotnet run
```
Создаст 250+ заказов с выручкой ~10M RUB для тестирования аналитики.

## 🔧 Конфигурация

### Environment Variables

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key
```

**Backend (appsettings.Development.json):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=restaurant_db;Username=postgres;Password=postgres"
  }
}
```

## 📋 API Endpoints

### Бронирования
- `GET /api/bookings` - все бронирования
- `GET /api/bookings/search` - поиск по телефону/имени
- `POST /api/bookings` - создать бронирование
- `GET /api/bookings/{id}` - детали бронирования

### Заказы
- `GET /api/orders` - все заказы
- `POST /api/orders` - создать заказ
- `GET /api/orders/{id}` - детали заказа

### Меню
- `GET /api/menu` - все блюда
- `POST /api/menu` - добавить блюдо

### Аналитика
- `GET /api/analytics/dashboard` - KPI дашборда
- `GET /api/analytics/reports/revenue` - отчёт по выручке

### Уведомления
- `GET /api/notifications/latest` - последние уведомления
- `GET /api/notifications/unread` - непрочитанные

## 👥 Тестовые аккаунты

- **Администратор:** `admin@restaurant.com` / `admin123`
- **Официант:** `waiter1@restaurant.com` / `waiter123`

## 🛠️ Разработка

### Scripts
```bash
# Frontend
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint

# Backend
dotnet build         # Build project
dotnet run           # Run API
dotnet test          # Run tests
```

### Database Migrations
```bash
# Создать новую миграцию
dotnet ef migrations add MigrationName --project Restaurant.Infrastructure --startup-project Restaurant.Api

# Применить миграции
dotnet ef database update --project Restaurant.Infrastructure --startup-project Restaurant.Api
```

## 📚 Документация

- [AI Features](./docs/AI_FEATURES.md) - возможности ИИ
- [API Integration](./docs/BACKEND_INTEGRATION.md) - интеграция с backend
- [Deployment](./docs/DEPLOYMENT.md) - развёртывание
- [AI Agent Instructions](./.github/copilot-instructions.md) - инструкции для AI

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Структура проекта

```
├── app/                    # Next.js App Router страницы
│   ├── (public)/          # Публичные маршруты (/, /menu, /booking)
│   ├── staff/             # Маршруты для официантов
│   ├── admin/             # Маршруты для администраторов
│   └── api/               # API роуты (если нужны)
├── components/            # React компоненты
│   ├── ui/               # Базовые UI компоненты
│   └── features/         # Бизнес-компоненты
├── lib/                   # Утилиты и хелперы
│   ├── api/              # API клиент
│   ├── hooks/            # Кастомные React хуки
│   └── utils/            # Вспомогательные функции
├── types/                 # TypeScript типы
├── constants/             # Константы приложения
└── public/               # Статические файлы

```

## Функциональность

### 🌐 Client (Публичная часть)
- Просмотр меню по категориям с фильтрацией
- Онлайн-бронирование столов
- Поиск брони по имени + 4 цифрам телефона
- Опциональный предзаказ блюд

### 👔 Staff (Официанты)
- Открытие и ведение заказов
- Добавление позиций в заказ
- Закрытие заказов
- Печать чеков в формате методички
- Доступ к AI-рекомендациям по блюдам

### 🎯 Admin (Администраторы)

#### Базовые функции
- CRUD операции с меню и столами
- Управление бронированиями
- Управление официантами
- Детальные отчёты по всем метрикам

#### AI-панель управления
- **Дневные дайджесты** - автоматический анализ работы
- **Прогнозы спроса** - планирование закупок и персонала
- **Рекомендации** - действенные советы по улучшению:
  - Оптимизация меню
  - Управление персоналом
  - Стратегии ценообразования
  - Маркетинговые инсайты
- **AI-чат** - интерактивные вопросы и ответы
- **История AI-запросов** - аудит и анализ

#### Аналитика
- **Dashboard** - общая картина бизнеса
- **Выручка** - детализация по периодам, категориям
- **Меню** - производительность блюд и категорий
- **Персонал** - эффективность официантов
- **Клиенты** - анализ поведения и лояльности
- **Экспорты** - данные в CSV, Excel, PDF

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Копирование переменных окружения
cp .env.example .env

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Запуск продакшен-сборки
npm start
```

## Скрипты

- `npm run dev` - запуск в режиме разработки
- `npm run build` - сборка проекта
- `npm run start` - запуск собранного проекта
- `npm run lint` - проверка кода линтером
- `npm run type-check` - проверка типов TypeScript

## 🔐 Роли и доступ

- **client** - публичный доступ (/, /menu, /booking)
- **waiter** - доступ к /staff/**, AI-рекомендации по блюдам
- **manager** - доступ к /admin/**, аналитика, AI-инсайты
- **admin** - полный доступ ко всем функциям

## 📚 Документация

- [AI API Reference](./docs/AI_API.md) - полная документация REST API
- [Backend Implementation Guide](./docs/BACKEND_IMPLEMENTATION.md) - руководство по реализации backend
- [Technical Specification](./docs/AI_FEATURES.md) - техническая спецификация AI-функций
- [Project Summary](./PROJECT_SUMMARY.md) - обзор проекта
- [Quick Start](./QUICKSTART.md) - быстрый старт
- [Roadmap](./ROADMAP.md) - план развития

## 🗄️ База данных

Проект включает SQL миграции для PostgreSQL:
- `backend/migrations/002_ai_analytics.sql` - схема для AI и аналитики (8+ новых таблиц)

Ключевые таблицы:
- `AiRequests` - история AI-запросов для аудита
- `DailyDigests` - сохранённые дайджесты
- `DishForecasts` - прогнозы спроса на блюда
- `AiRecommendations` - AI-рекомендации
- `Notifications` - система уведомлений
- `UserSessions` - трекинг активности
- `OrderAnalytics`, `MenuAnalytics`, `ClientPreferences` - детальная аналитика

## 🚀 Быстрый старт

### Frontend
```bash
# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env

# Запуск в режиме разработки
npm run dev
```

### Backend
```bash
# Применить миграции
psql -U postgres -d restaurant_db -f backend/migrations/002_ai_analytics.sql

# Настроить OpenAI API ключ в appsettings.json
# Запустить .NET проект
cd backend/Restaurant.Api
dotnet run
```

## 🧪 Тестирование

```bash
# Frontend
npm run test
npm run test:watch

# Backend
cd backend
dotnet test
```

## 📦 Deployment

### Production Build
```bash
# Frontend
npm run build
npm start

# Backend
cd backend/Restaurant.Api
dotnet publish -c Release -o ./publish
```

### Docker (опционально)
```bash
docker-compose up -d
```

## 🔧 Требования

### Frontend
- Node.js 18+
- npm или yarn

### Backend
- .NET 8 SDK
- PostgreSQL 15+
- Redis (для кэширования)
- OpenAI API ключ

## 🌟 Основные компоненты

### Frontend
- `components/features/ai/AiChatWidget.tsx` - AI чат-виджет
- `components/features/notifications/NotificationBell.tsx` - система уведомлений
- `components/features/metrics/MetricCards.tsx` - переиспользуемые карточки метрик
- `app/admin/ai-insights/page.tsx` - AI-панель управления
- `lib/hooks/useAi.ts` - React hooks для AI
- `lib/hooks/useAnalytics.ts` - React hooks для аналитики

### Backend (требуется реализация)
- `AiService.cs` - основной сервис AI
- `OpenAiService.cs` - интеграция с OpenAI
- `AnalyticsService.cs` - сервис аналитики
- `NotificationService.cs` - система уведомлений

## 🤝 Вклад в проект

Проект открыт для улучшений и расширений. См. [ROADMAP.md](./ROADMAP.md) для планируемых функций.

## 📄 Лицензия

Проект разработан для учебных и коммерческих целей.
