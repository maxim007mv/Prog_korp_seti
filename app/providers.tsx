'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { OrderCartProvider } from '@/lib/contexts/OrderCartContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 минут
            refetchOnWindowFocus: false,
            retry: 3, // Повторить 3 раза при ошибке
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <OrderCartProvider>
        {children}
      </OrderCartProvider>
    </QueryClientProvider>
  );
}
