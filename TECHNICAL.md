# Технические решения и архитектура

## Архитектурные решения

### 1. Выбор Next.js 14 (App Router)

**Почему Next.js 14?**
- Server Components по умолчанию для оптимальной производительности
- Встроенная оптимизация изображений и шрифтов
- File-based routing упрощает структуру
- API Routes для возможных серверных эндпоинтов
- Отличная поддержка TypeScript

**App Router vs Pages Router:**
- Используем App Router (новый стандарт)
- Server Components снижают bundle size клиента
- Layouts для переиспользования структуры
- Loading.tsx и Error.tsx для лучшего UX

### 2. State Management

**TanStack Query (React Query)**
- Управление серверным состоянием
- Автоматическое кэширование и инвалидация
- Оптимистичные обновления
- Retry логика
- Стандартизированный подход к загрузке/ошибкам

**Локальное состояние**
- React hooks (useState, useReducer) для UI состояния
- Context API для глобальных настроек (theme, auth)
- Не используем Redux - избыточно для этого проекта

### 3. Работа с формами

**react-hook-form + Zod**
- Минимальные ре-рендеры
- Встроенная валидация
- Type-safe с TypeScript
- Простая интеграция с Zod-схемами

Пример:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema } from '@/lib/validations';

const form = useForm({
  resolver: zodResolver(bookingSchema),
});
```

### 4. Стилизация

**TailwindCSS**
- Utility-first для быстрой разработки
- Purging неиспользуемых стилей
- Responsive дизайн из коробки
- Темизация через CSS variables

**Организация стилей:**
- `globals.css` - базовые стили и кастомные утилиты
- Компонентные стили через className
- CSS Modules - только для сложных анимаций

### 5. TypeScript конфигурация

**Строгий режим:**
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

**Алиасы путей:**
```json
{
  "@/*": ["./*"],
  "@/components/*": ["./components/*"],
  "@/lib/*": ["./lib/*"]
}
```

## Структура данных

### Нормализация данных

**Блюда (Dish)**
- Хранятся с полной информацией
- Категоризированы для быстрого доступа
- Теги для фильтрации

**Заказы (Order)**
- Денормализованы для быстрого чтения
- Включают snapshot блюд (цены могут меняться)
- Связаны с официантом и столом

**Бронирования (Booking)**
- Привязаны к столу
- Маскированные телефоны в UI
- Последние 4 цифры для поиска

### Связи между сущностями

```
Table 1 ──── N Booking
Table 1 ──── N Order

Order N ──── 1 Waiter
Order N ──── 1 Table
Order 1 ──── N OrderItem

OrderItem N ──── 1 Dish
```

## Паттерны кода

### 1. Композиция компонентов

Используем compound components pattern:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
  </CardHeader>
  <CardContent>Контент</CardContent>
  <CardFooter>Футер</CardFooter>
</Card>
```

### 2. Кастомные хуки

Инкапсулируем логику в переиспользуемые хуки:

```typescript
// lib/hooks/useBooking.ts
export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
    },
  });
}
```

### 3. Render Props (опционально)

Для сложных компонентов с переиспользуемой логикой:

```typescript
<DataTable
  data={dishes}
  renderRow={(dish) => <DishRow dish={dish} />}
  renderEmpty={() => <EmptyState />}
/>
```

### 4. Higher-Order Components (ограниченно)

Только для аутентификации:

```typescript
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: UserRole
) {
  return function AuthenticatedComponent(props: P) {
    const { user } = useAuth();
    
    if (!user || user.role !== requiredRole) {
      return <Redirect to="/login" />;
    }
    
    return <Component {...props} />;
  };
}
```

## API коммуникация

### Структура клиента

```typescript
// lib/api/client.ts
const BASE_URL = process.env.API_BASE_URL;

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include', // Для httpOnly cookies
    });

    if (!response.ok) {
      throw new ApiError(response);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  // patch, delete...
}

export const apiClient = new ApiClient();
```

### Обработка ошибок

```typescript
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public errors?: Record<string, string[]>
  ) {
    super('API Error');
  }
}

// В компоненте
const { data, error, isLoading } = useMenu();

if (error) {
  return <ErrorState error={error} />;
}
```

## Безопасность

### 1. Аутентификация

- JWT в httpOnly cookies (защита от XSS)
- Refresh token механизм
- Автоматический refresh при 401

### 2. Авторизация

- Проверка роли на клиенте (UI)
- Проверка роли на сервере (защита)
- Middleware Next.js для защиты роутов

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const role = parseRole(token);
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}
```

### 3. Валидация

- Zod-схемы на клиенте
- Дублирование валидации на сервере
- Sanitization пользовательского ввода

### 4. CSRF защита

- Синхронизация токенов
- SameSite cookies
- Origin проверка

## Производительность

### 1. Оптимизация рендера

- React.memo для дорогих компонентов
- useMemo для вычислений
- useCallback для функций в deps
- Виртуализация для длинных списков (react-window)

### 2. Код-сплиттинг

```typescript
const AdminReports = dynamic(() => import('@/components/admin/Reports'), {
  loading: () => <SkeletonReports />,
});
```

### 3. Оптимизация изображений

```typescript
import Image from 'next/image';

<Image
  src={dish.imageUrl}
  alt={dish.name}
  width={300}
  height={200}
  placeholder="blur"
/>
```

### 4. Кэширование

- TanStack Query staleTime
- Next.js кэширование fetch
- Service Worker (PWA)

## Доступность (A11y)

### Чеклист

- [x] Семантический HTML (header, nav, main, section)
- [x] ARIA-атрибуты где нужно
- [x] Клавиатурная навигация (tabIndex, onKeyDown)
- [x] Focus management (автофокус в модалах)
- [x] Контраст цветов ≥ WCAG AA
- [x] Hit areas ≥ 44x44px (touch-friendly)
- [ ] Screen reader тестирование
- [ ] Альтернативный текст для изображений

### Примеры

```typescript
// Модальное окно
<div
  role="dialog"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Заголовок</h2>
  <p id="modal-description">Описание</p>
</div>

// Кнопка с иконкой
<button aria-label="Закрыть">
  <X className="h-5 w-5" />
</button>
```

## Тестирование

### Стратегия

**Unit тесты (Jest)**
- Утилиты (utils.ts)
- Валидации (Zod-схемы)
- Чистые функции

**Component тесты (React Testing Library)**
- UI компоненты
- Формы
- Интерактивность

**E2E тесты (Playwright)**
- Критичные user flows
- Интеграция между страницами
- Cross-browser тестирование

### Покрытие

Минимальное покрытие:
- Утилиты: 90%
- Компоненты: 70%
- E2E: Основные сценарии

## CI/CD

### GitHub Actions (рекомендуется)

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
```

### Деплой

**Vercel (рекомендуется для Next.js)**
- Автоматический деплой из main
- Preview deployments для PR
- Edge функции

**Альтернативы:**
- Netlify
- AWS Amplify
- Docker + любой хостинг

## Мониторинг

### Логирование

- Структурированные логи (JSON)
- Контекст: userId, requestId, timestamp
- Уровни: error, warn, info, debug

### Аналитика ошибок

**Sentry** (рекомендуется)
- Автоматический захват ошибок
- Source maps для стека
- User context

### Метрики производительности

- Web Vitals (LCP, FID, CLS)
- Core Web Vitals через Next.js analytics
- Custom metrics для бизнес-логики

## Документация

### Обязательная

- [x] README.md - обзор проекта
- [x] SETUP.md - инструкции по установке
- [x] ROADMAP.md - план разработки
- [x] TECHNICAL.md - технические решения (этот файл)
- [ ] API.md - документация API (после реализации)

### Рекомендуемая

- [ ] CONTRIBUTING.md - guidelines для контрибьюторов
- [ ] CHANGELOG.md - история изменений
- [ ] Storybook - документация компонентов

## Заключение

Эта архитектура обеспечивает:
- ✅ Масштабируемость
- ✅ Поддерживаемость
- ✅ Производительность
- ✅ Безопасность
- ✅ Доступность
- ✅ Тестируемость

При возникновении вопросов - обращайтесь к этому документу или официальной документации используемых технологий.
