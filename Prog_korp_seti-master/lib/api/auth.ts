import { apiClient } from './client';
import type { 
  LoginCredentials, 
  RegisterCredentials, 
  User, 
  LoginResponse,
  RegisterResponse 
} from '@/types';

/**
 * API для работы с аутентификацией
 */
export const authApi = {
  /**
   * Вход в систему
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  /**
   * Регистрация нового пользователя
   */
  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    return apiClient.post<RegisterResponse>('/auth/register', credentials);
  },

  /**
   * Выход из системы
   */
  logout: async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout');
  },

  /**
   * Получить текущего пользователя
   */
  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>('/auth/me');
  },

  /**
   * Обновить токен
   */
  refreshToken: async (): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/refresh');
  },
};
