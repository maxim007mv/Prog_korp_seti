# Установка и запуск проекта

## Шаг 1: Установка зависимостей

```bash
npm install
```

Эта команда установит все необходимые пакеты из `package.json`:
- Next.js 14 и React 18
- TypeScript
- TailwindCSS
- TanStack Query для управления данными
- Headless UI для доступных компонентов
- Lucide React для иконок
- Zod для валидации
- Recharts для графиков
- и другие зависимости

## Шаг 2: Настройка переменных окружения

Скопируйте файл `.env.example` в `.env`:

```bash
cp .env.example .env
```

Отредактируйте `.env` файл и укажите:

```env
# API Configuration
API_BASE_URL=http://localhost:3001/api

# Auth Configuration
AUTH_ISSUER=http://localhost:3001
JWT_SECRET=your-secret-key-here

# Feature Flags
FEATURE_AI=true
FEATURE_I18N=false

# Build Configuration
BUILD_TARGET=production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Шаг 3: Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: **http://localhost:3000**

## Шаг 4: Сборка для продакшена

```bash
npm run build
npm start
```

## Полезные команды

```bash
# Проверка типов TypeScript
npm run type-check

# Линтинг кода
npm run lint

# Запуск тестов (когда будут добавлены)
npm run test

# Запуск E2E тестов (когда будут добавлены)
npm run test:e2e
```

## Структура проекта

```
├── app/                    # Next.js App Router
│   ├── (public)/          # Публичные страницы
│   │   ├── page.tsx       # Главная страница
│   │   ├── menu/          # Страница меню
│   │   └── booking/       # Бронирование
│   ├── staff/             # Страницы для официантов
│   ├── admin/             # Страницы для администраторов
│   ├── globals.css        # Глобальные стили
│   ├── layout.tsx         # Корневой layout
│   └── providers.tsx      # React Context провайдеры
│
├── components/            # React компоненты
│   ├── ui/               # Базовые UI компоненты
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Skeleton.tsx
│   └── features/         # Бизнес-компоненты (TODO)
│
├── lib/                   # Утилиты и хелперы
│   ├── utils.ts          # Общие утилиты
│   ├── api/              # API клиент (TODO)
│   └── hooks/            # Кастомные хуки (TODO)
│
├── types/                 # TypeScript типы
│   ├── dish.ts           # Типы блюд и меню
│   ├── table.ts          # Типы столов
│   ├── booking.ts        # Типы бронирований
│   ├── order.ts          # Типы заказов
│   ├── user.ts           # Типы пользователей
│   ├── reports.ts        # Типы отчётов
│   ├── ai.ts             # Типы AI функций
│   └── api.ts            # Типы API
│
├── constants/            # Константы приложения
│   └── index.ts          # Категории, валидации, статусы
│
└── public/               # Статические файлы
```

## Что уже реализовано

✅ Базовая структура Next.js 14 с App Router  
✅ Конфигурация TypeScript  
✅ Настройка TailwindCSS с кастомными цветами и стилями  
✅ Все TypeScript типы согласно ТЗ  
✅ Константы и утилиты  
✅ Базовые UI компоненты (Button, Input, Card, Badge, Skeleton)  
✅ Главная страница с hero-секцией  
✅ Заглушки для страниц: /menu, /booking, /booking/search  
✅ Настройка TanStack Query (React Query)  
✅ Глобальные стили с поддержкой печати чеков  

## Что нужно реализовать

### Высокий приоритет

1. **API клиент** (`lib/api/client.ts`)
   - Базовый HTTP клиент с перехватчиками
   - Обработка ошибок и авторизации

2. **Хуки для данных** (`lib/hooks/`)
   - useMenu - получение меню
   - useBookings - работа с бронированиями
   - useOrders - работа с заказами
   - useReports - получение отчётов

3. **Компоненты меню** (`components/features/menu/`)
   - MenuCategoryTabs - вкладки категорий
   - DishCard - карточка блюда
   - MenuFilters - фильтры меню

4. **Компоненты бронирования** (`components/features/booking/`)
   - BookingForm - форма бронирования
   - TableCard - карточка стола
   - BookingList - список броней

5. **Страницы Staff**
   - `/staff` - список активных заказов
   - `/staff/orders/[id]` - редактирование заказа
   - `/staff/receipt/[id]/print` - печать чека

6. **Страницы Admin**
   - `/admin` - дашборд с KPI
   - `/admin/menu` - управление меню
   - `/admin/tables` - управление столами
   - `/admin/bookings` - управление бронями
   - `/admin/orders` - журнал заказов
   - `/admin/reports` - отчёты

7. **Компоненты отчётов** (`components/features/reports/`)
   - RevenueChart - график выручки
   - WaiterRankTable - рейтинг официантов
   - PopularDishesChart - популярные блюда

8. **Middleware и Auth**
   - `middleware.ts` - защита роутов
   - `lib/auth.ts` - функции аутентификации
   - Компоненты RoleGuard, ProtectedRoute

### Средний приоритет

9. **Дополнительные UI компоненты**
   - Modal - модальное окно
   - Toast - уведомления
   - Select - выпадающий список
   - Tabs - вкладки
   - Table - таблица

10. **Валидация форм**
    - Схемы Zod для всех форм
    - Интеграция с react-hook-form

11. **AI компоненты** (если FEATURE_AI=true)
    - NLP поиск по меню
    - Upsell предложения

### Низкий приоритет

12. **Тесты**
    - Unit тесты для утилит
    - Component тесты
    - E2E тесты с Playwright

13. **i18n** (если FEATURE_I18N=true)
    - Настройка next-intl
    - Переводы на английский

14. **PWA** (опционально)
    - Service Worker
    - Offline поддержка
    - Push уведомления

## Рекомендации по разработке

### Порядок разработки

1. Начните с **API клиента** - это фундамент для всех запросов
2. Затем реализуйте **хуки для данных** - они будут использоваться во всех компонентах
3. Реализуйте **страницы Client** (/menu, /booking) - самые простые
4. Затем **страницы Staff** - средней сложности
5. В конце **страницы Admin** с отчётами - самые сложные

### Работа с API

Создайте моковый API или используйте готовый бэкенд. Пример структуры API клиента:

```typescript
// lib/api/client.ts
const API_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

export async function fetchMenu() {
  const res = await fetch(`${API_URL}/menu`);
  return res.json();
}

export async function createBooking(data: BookingCreate) {
  const res = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
```

### Использование TanStack Query

```typescript
// lib/hooks/useMenu.ts
import { useQuery } from '@tanstack/react-query';
import { fetchMenu } from '@/lib/api/client';

export function useMenu() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: fetchMenu,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}
```

### Валидация с Zod

```typescript
// lib/validations/booking.ts
import { z } from 'zod';

export const bookingSchema = z.object({
  clientName: z.string().min(2, 'Имя должно быть не менее 2 символов'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Неверный формат телефона'),
  start: z.string().datetime(),
  end: z.string().datetime(),
  guests: z.number().min(1).max(20),
});
```

## Troubleshooting

### Ошибки TypeScript при разработке

Это нормально - TypeScript-ошибки исчезнут после установки зависимостей (`npm install`).

### Tailwind классы не работают

Убедитесь, что:
1. Запущен dev-сервер (`npm run dev`)
2. В `tailwind.config.ts` указаны правильные пути к файлам
3. Импортирован `globals.css` в `layout.tsx`

### Проблемы с путями (@/...)

Проверьте `tsconfig.json` - там настроены алиасы путей:
```json
"paths": {
  "@/*": ["./*"]
}
```

## Поддержка

Для вопросов и проблем:
- Проверьте документацию Next.js: https://nextjs.org/docs
- TanStack Query: https://tanstack.com/query/latest
- TailwindCSS: https://tailwindcss.com/docs

Удачи в разработке! 🚀
