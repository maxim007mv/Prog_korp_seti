import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware для защиты роутов на основе ролей пользователей
 * 
 * РЕЖИМ РАЗРАБОТКИ: Временно отключена строгая проверка для тестирования
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // TEMPORARY: В режиме разработки разрешаем доступ ко всем страницам
  // TODO: Включить обратно после настройки авторизации
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // В режиме разработки разрешаем всё
    return NextResponse.next();
  }

  // Получаем токен из cookies
  const token = request.cookies.get('accessToken')?.value;
  
  // Извлекаем роль из токена (предполагается JWT)
  // В реальном приложении нужно декодировать и валидировать JWT
  let userRole: string | null = null;
  
  if (token) {
    try {
      // Простая декодировка JWT (в production использовать библиотеку jsonwebtoken)
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );
      userRole = payload.role;
    } catch (error) {
      // Токен невалиден
      userRole = null;
    }
  }

  // Публичные роуты (доступны всем)
  const publicRoutes = ['/', '/menu', '/login', '/register'];
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Роуты для клиентов
  const clientRoutes = ['/booking'];
  const isClientRoute = clientRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Роуты для официантов
  const waiterRoutes = ['/staff'];
  const isWaiterRoute = waiterRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Роуты для администраторов
  const adminRoutes = ['/admin'];
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Если пользователь не авторизован
  if (!token || !userRole) {
    // Разрешаем доступ к публичным роутам
    if (isPublicRoute) {
      return NextResponse.next();
    }
    
    // Редирект на страницу входа для защищенных роутов
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Пользователь авторизован - проверяем доступ по ролям
  
  // Админ имеет доступ ко всем роутам
  if (userRole === 'admin') {
    return NextResponse.next();
  }

  // Официант имеет доступ к своим роутам
  if (userRole === 'waiter') {
    if (isWaiterRoute || isPublicRoute || isClientRoute) {
      return NextResponse.next();
    }
    // Редирект на страницу персонала, если пытается попасть на админские роуты
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/staff', request.url));
    }
  }

  // Клиент имеет доступ к публичным роутам и бронированию
  if (userRole === 'client') {
    if (isPublicRoute || isClientRoute) {
      return NextResponse.next();
    }
    // Редирект на главную, если пытается попасть на защищенные роуты
    if (isAdminRoute || isWaiterRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Если авторизован и на странице входа/регистрации - редирект на главную
  if (pathname === '/login' || pathname === '/register') {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (userRole === 'waiter') {
      return NextResponse.redirect(new URL('/staff', request.url));
    } else {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

/**
 * Конфигурация matcher для middleware
 * Применяется ко всем роутам, кроме статических файлов и API
 */
export const config = {
  matcher: [
    /*
     * Применить middleware ко всем роутам кроме:
     * - api (API routes)
     * - _next/static (статические файлы)
     * - _next/image (оптимизация изображений)
     * - favicon.ico (иконка)
     * - public файлы
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
