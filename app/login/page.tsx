'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useLogin } from '@/lib/hooks';
import type { LoginCredentials } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await loginMutation.mutateAsync(credentials);
      
      // Перенаправление в зависимости от роли
      if (response.user.role === 'admin') {
        router.push('/admin');
      } else if (response.user.role === 'waiter') {
        router.push('/staff');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка входа. Проверьте данные.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <LogIn className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold">Вход в систему</h1>
          <p className="mt-2 text-gray-600">
            Введите свои учётные данные
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>
            <Input
              type="email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              placeholder="admin@restaurant.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Пароль
            </label>
            <Input
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Вход...' : 'Войти'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Тестовые аккаунты:</p>
          <p className="mt-1">
            <strong>Админ:</strong> admin@restaurant.com / admin123
          </p>
          <p>
            <strong>Официант:</strong> waiter@restaurant.com / waiter123
          </p>
        </div>
      </Card>
    </div>
  );
}
