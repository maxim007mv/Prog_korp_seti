'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useRegister } from '@/lib/hooks';
import { registerWaiterSchema } from '@/lib/validations';
import type { RegisterCredentials, UserRole } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterCredentials>({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'client',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');

  const registerMutation = useRegister();

  const handleRoleChange = (role: UserRole) => {
    setFormData({ ...formData, role });
    // Очищаем ошибки при смене роли
    setErrors({});
  };

  const validateForm = (): boolean => {
    try {
      registerWaiterSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err: any) {
      const fieldErrors: Record<string, string> = {};
      err.errors?.forEach((error: any) => {
        const field = error.path[0];
        if (field) {
          fieldErrors[field] = error.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    try {
      const response = await registerMutation.mutateAsync(formData);
      
      // Перенаправление в зависимости от роли
      if (response.user.role === 'admin') {
        router.push('/admin');
      } else if (response.user.role === 'waiter') {
        router.push('/staff');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setApiError(err.message || 'Ошибка регистрации. Попробуйте снова.');
    }
  };

  const handleInputChange = (field: keyof RegisterCredentials, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Удаляем ошибку для этого поля
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <div className="mb-8">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Назад к входу
          </Link>
        </div>

        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <UserPlus className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold">Регистрация</h1>
          <p className="mt-2 text-gray-600">
            Создайте аккаунт для доступа к системе
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {apiError && (
            <div className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
              {apiError}
            </div>
          )}

          {/* Выбор роли */}
          <div>
            <label className="mb-3 block text-sm font-medium">
              Выберите роль
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange('client')}
                className={`rounded-lg border-2 p-4 text-center transition-all ${
                  formData.role === 'client'
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg font-semibold">Клиент</div>
                <div className="mt-1 text-xs text-gray-600">
                  Бронирование и меню
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('waiter')}
                className={`rounded-lg border-2 p-4 text-center transition-all ${
                  formData.role === 'waiter'
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg font-semibold">Официант</div>
                <div className="mt-1 text-xs text-gray-600">
                  Управление заказами
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`rounded-lg border-2 p-4 text-center transition-all ${
                  formData.role === 'admin'
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg font-semibold">Админ</div>
                <div className="mt-1 text-xs text-gray-600">
                  Полный доступ
                </div>
              </button>
            </div>
            {errors.role && (
              <p className="mt-2 text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          {/* Основные поля */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Имя <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Иван Иванов"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="ivan@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Телефон (обязателен для официантов) */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Телефон
              {formData.role === 'waiter' && (
                <span className="text-red-500"> *</span>
              )}
              {formData.role !== 'waiter' && (
                <span className="text-gray-500"> (необязательно)</span>
              )}
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+79991234567"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
            {formData.role === 'waiter' && (
              <p className="mt-1 text-xs text-gray-600">
                Телефон обязателен для официантов
              </p>
            )}
          </div>

          {/* Пароли */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Пароль <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="••••••••"
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-600">
                Минимум 6 символов, включая заглавные, строчные буквы и цифры
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Подтверждение пароля <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                value={formData.passwordConfirm}
                onChange={(e) =>
                  handleInputChange('passwordConfirm', e.target.value)
                }
                placeholder="••••••••"
                className={errors.passwordConfirm ? 'border-red-500' : ''}
              />
              {errors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.passwordConfirm}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Уже есть аккаунт?{' '}
            <Link
              href="/login"
              className="font-medium text-accent hover:underline"
            >
              Войти
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
