# Система регистрации и авторизации с ролями

## Обзор

Полная система регистрации и авторизации с поддержкой ролей (клиент, официант, администратор) для Next.js приложения ресторана.

## Реализованные компоненты

### 1. Типы (types/user.ts)

```typescript
// Роли пользователей
type UserRole = 'client' | 'waiter' | 'admin';

// Данные для регистрации
interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: UserRole;
  phone?: string; // Обязательно для официантов
}
```

### 2. Валидация (lib/validations/index.ts)

Схемы Zod для валидации:

- **loginSchema** - валидация входа
- **registerWaiterSchema** - валидация регистрации с проверкой телефона для официантов

Правила валидации:
- Имя: минимум 2 символа
- Email: валидный формат
- Пароль: минимум 6 символов, заглавные/строчные буквы и цифры
- Телефон: обязателен для официантов, формат +79991234567

### 3. API (lib/api/endpoints.ts)

```typescript
authApi.register(credentials: RegisterCredentials): Promise<RegisterResponse>
```

### 4. Хуки (lib/hooks/useAuth.ts)

```typescript
const { mutateAsync, isPending, error } = useRegister();
```

### 5. Страница регистрации (app/register/page.tsx)

Особенности:
- Выбор роли с визуальной индикацией
- Адаптивные поля (телефон показывается как обязательный для официантов)
- Валидация в реальном времени
- Показ ошибок по полям
- Автоматический редирект после регистрации по роли

### 6. Middleware (middleware.ts)

Server-side защита роутов:

**Логика доступа:**

| Роль | Доступные роуты |
|------|-----------------|
| Клиент | `/`, `/menu`, `/booking` |
| Официант | `/staff/**`, `/menu`, `/booking` |
| Администратор | Все роуты |

**Редиректы:**
- Неавторизованный → `/login`
- Клиент пытается в `/admin` → `/`
- Официант пытается в `/admin` → `/staff`
- Авторизованный на `/login` → роутрол по роли

### 7. Компоненты защиты (components/features/auth/)

#### ProtectedRoute

Для защиты целых страниц:

```tsx
import { ProtectedRoute } from '@/components/features/auth';

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

#### RoleGuard

Для условного рендеринга UI:

```tsx
import { RoleGuard } from '@/components/features/auth';

<RoleGuard allowedRoles={['admin', 'waiter']}>
  <AdminButton />
</RoleGuard>
```

#### RoleCheck

Упрощенная проверка роли:

```tsx
import { RoleCheck } from '@/components/features/auth';

<RoleCheck role="admin" fallback={<p>Нет доступа</p>}>
  <SecretContent />
</RoleCheck>
```

#### Хуки проверки ролей

```tsx
import { 
  useHasRole, 
  useIsAdmin, 
  useIsWaiter, 
  useIsClient 
} from '@/components/features/auth';

const isAdmin = useIsAdmin();
const hasAccess = useHasRole(['admin', 'waiter']);
```

## Использование

### Регистрация пользователя

1. Перейти на `/register`
2. Выбрать роль
3. Заполнить форму
4. Для официантов обязательно указать телефон
5. После успешной регистрации - автоматический вход и редирект

### Защита страницы

```tsx
// app/admin/page.tsx
'use client';

import { ProtectedRoute } from '@/components/features/auth';

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {/* Контент только для админов */}
    </ProtectedRoute>
  );
}
```

### Условный рендеринг

```tsx
import { RoleGuard, useIsAdmin } from '@/components/features/auth';

function Dashboard() {
  const isAdmin = useIsAdmin();

  return (
    <div>
      <h1>Панель управления</h1>
      
      {/* Показываем только админам */}
      <RoleGuard allowedRoles={['admin']}>
        <AdminSettings />
      </RoleGuard>

      {/* Или используя хук */}
      {isAdmin && <DangerZone />}
    </div>
  );
}
```

## Безопасность

### Server-side
- Middleware проверяет JWT токен и роль на каждом запросе
- Декодирует JWT и извлекает роль
- Блокирует доступ к защищенным роутам

### Client-side
- ProtectedRoute проверяет авторизацию через API
- RoleGuard скрывает UI элементы
- Валидация форм на клиенте и сервере

### JWT токены
Middleware ожидает JWT токен в cookies с именем `accessToken`:

```typescript
const token = request.cookies.get('accessToken')?.value;
```

Payload токена должен содержать:
```json
{
  "userId": 1,
  "email": "user@example.com",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Роуты

| Путь | Доступ | Описание |
|------|--------|----------|
| `/` | Все | Главная страница |
| `/menu` | Все | Меню ресторана |
| `/login` | Неавторизованные | Вход в систему |
| `/register` | Неавторизованные | Регистрация |
| `/booking` | Авторизованные | Бронирование столов |
| `/staff/**` | Официант, Админ | Панель персонала |
| `/admin/**` | Админ | Админ панель |

## Примеры использования

### Пример 1: Защищенная страница персонала

```tsx
// app/staff/page.tsx
import { ProtectedRoute } from '@/components/features/auth';
import { StaffDashboard } from '@/components/features/staff';

export default function StaffPage() {
  return (
    <ProtectedRoute allowedRoles={['waiter', 'admin']}>
      <StaffDashboard />
    </ProtectedRoute>
  );
}
```

### Пример 2: Навигационное меню с проверкой ролей

```tsx
import { useCurrentUser } from '@/lib/hooks';
import { RoleCheck } from '@/components/features/auth';

function Navigation() {
  const { data: user } = useCurrentUser();

  return (
    <nav>
      <Link href="/">Главная</Link>
      <Link href="/menu">Меню</Link>
      
      {user && <Link href="/booking">Бронирование</Link>}
      
      <RoleCheck role={['waiter', 'admin']}>
        <Link href="/staff">Персонал</Link>
      </RoleCheck>
      
      <RoleCheck role="admin">
        <Link href="/admin">Администрирование</Link>
      </RoleCheck>
    </nav>
  );
}
```

### Пример 3: Регистрация с обработкой ошибок

```tsx
import { useRegister } from '@/lib/hooks';
import { registerWaiterSchema } from '@/lib/validations';

function RegisterForm() {
  const { mutateAsync, isPending } = useRegister();
  const [formData, setFormData] = useState({...});
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Валидация
      registerWaiterSchema.parse(formData);
      
      // Регистрация
      const response = await mutateAsync(formData);
      
      // Редирект по роли
      router.push(response.user.role === 'admin' ? '/admin' : '/');
    } catch (error) {
      // Обработка ошибок
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Требования к backend

Backend должен реализовать:

1. **POST /auth/register**
   - Принимает RegisterCredentials
   - Валидирует данные
   - Создает пользователя
   - Возвращает RegisterResponse с токенами

2. **POST /auth/login**
   - Принимает LoginCredentials
   - Проверяет credentials
   - Возвращает LoginResponse с токенами

3. **GET /auth/me**
   - Проверяет JWT токен
   - Возвращает данные текущего пользователя

4. **JWT токены**
   - Включают поле `role` в payload
   - Устанавливаются в cookies
   - Имеют срок действия

## Тестирование

После регистрации можно войти используя:

**Клиент:**
- Email: любой новый
- Доступ: `/`, `/menu`, `/booking`

**Официант:**
- Email: любой новый + телефон
- Доступ: `/staff`, `/menu`, `/booking`

**Администратор:**
- Email: любой новый
- Доступ: все роуты

## Дальнейшие улучшения

- [ ] Email верификация
- [ ] Восстановление пароля
- [ ] 2FA аутентификация
- [ ] OAuth провайдеры (Google, Facebook)
- [ ] История активности
- [ ] Управление сессиями
- [ ] Rate limiting для регистрации
- [ ] CAPTCHA защита
