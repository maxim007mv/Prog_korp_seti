/**
 * API Error class для обработки ошибок
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Базовый HTTP клиент для работы с API
 */
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:3001/api';
  }

  /**
   * Универсальный метод для выполнения запросов
   */
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // 🔍 ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ
    console.group(`🌐 API Request: ${options?.method || 'GET'} ${endpoint}`);
    console.log('📍 Full URL:', url);
    console.log('📦 Request body:', options?.body);
    console.log('🔧 Headers:', options?.headers);
    console.groupEnd();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        credentials: 'include', // Для httpOnly cookies
      });

      // 🔍 ЛОГИРОВАНИЕ ОТВЕТА
      console.group(`📡 API Response: ${options?.method || 'GET'} ${endpoint}`);
      console.log('✅ Status:', response.status, response.statusText);
      console.log('📄 Response headers:', Object.fromEntries(response.headers.entries()));

      // Обработка ошибок
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error response:', errorData);
        console.groupEnd();
        throw new ApiError(
          response.status,
          errorData.code || 'UNKNOWN_ERROR',
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          errorData.errors
        );
      }

      // Обработка пустого ответа (204 No Content)
      if (response.status === 204) {
        console.log('✅ Empty response (204 No Content)');
        console.groupEnd();
        return {} as T;
      }

      const data = await response.json();
      console.log('📦 Response data:', data);
      console.groupEnd();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('🚨 ApiError thrown:', error.message);
        throw error;
      }

      // Обработка сетевых ошибок
      console.group('🔥 NETWORK ERROR');
      console.error('Error details:', error);
      console.error('Base URL:', this.baseUrl);
      console.error('Endpoint:', endpoint);
      console.groupEnd();
      
      throw new ApiError(
        0,
        'NETWORK_ERROR',
        'Не удалось подключиться к серверу. Проверьте, что бэкенд запущен на ' + this.baseUrl
      );
    }
  }  /**
   * GET запрос
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request<T>(endpoint + queryString, { method: 'GET' });
  }

  /**
   * POST запрос
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH запрос
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT запрос
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE запрос
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * GET запрос для получения Blob (файлов)
   */
  async getBlob(endpoint: string, params?: Record<string, any>): Promise<Blob> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    const url = `${this.baseUrl}${endpoint}${queryString}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.code || 'UNKNOWN_ERROR',
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          errorData.errors
        );
      }

      return response.blob();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error('Network error:', error);
      throw new ApiError(
        0,
        'NETWORK_ERROR',
        'Не удалось подключиться к серверу'
      );
    }
  }
}

// Экспортируем единственный экземпляр клиента
export const apiClient = new ApiClient();
