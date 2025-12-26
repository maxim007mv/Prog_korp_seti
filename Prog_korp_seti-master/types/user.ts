/**
 * Роли пользователей
 */
export type UserRole = 'client' | 'waiter' | 'admin';

/**
 * Пользователь
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

/**
 * Официант (расширенная информация)
 */
export interface Waiter extends User {
  role: 'waiter';
  phone?: string;
}

/**
 * Создание/обновление официанта
 */
export interface WaiterInput {
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
}

/**
 * Токен аутентификации
 */
export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

/**
 * Данные аутентифицированного пользователя
 */
export interface AuthUser {
  user: User;
  token: AuthToken;
}

/**
 * Вход в систему
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Регистрация нового пользователя
 */
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: UserRole;
  phone?: string; // Обязательно для официантов
}

/**
 * Ответ при успешном входе
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Ответ при успешной регистрации
 */
export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
