'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui';
import { ReceiptView } from '@/components/features/orders';
import { useReceipt } from '@/lib/hooks';

export default function PrintReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);

  const { data: order, isLoading, error } = useReceipt(orderId);

  useEffect(() => {
    // Автоматически открыть диалог печати при загрузке
    if (order && !isLoading) {
      // Небольшая задержка для загрузки стилей
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [order, isLoading]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-red-600">Ошибка загрузки чека</p>
          {error && <p className="mt-2 text-sm text-red-500">{error.message}</p>}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Кнопки управления - скрываются при печати */}
      <div className="print:hidden sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Назад
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            <Printer className="mr-2 h-5 w-5" />
            Печать
          </Button>
        </div>
      </div>

      {/* Чек для печати */}
      <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0">
        <ReceiptView receipt={order} />
      </div>

      {/* Стили для печати */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
