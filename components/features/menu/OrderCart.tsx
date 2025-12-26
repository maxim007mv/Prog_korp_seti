'use client';

import { useState } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, Receipt } from 'lucide-react';
import { useOrderCart } from '@/lib/contexts/OrderCartContext';
import { useCreateOrder } from '@/lib/hooks/useOrders';
import { formatPrice } from '@/lib/utils';
import type { OrderCreate } from '@/types';

export function OrderCart() {
  const {
    items,
    tableId,
    bookingId,
    removeItem,
    updateQuantity,
    updateComment,
    clearCart,
    getTotalPrice,
    getItemCount,
  } = useOrderCart();

  const [showCart, setShowCart] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const createOrder = useCreateOrder();

  const itemCount = getItemCount();
  const totalPrice = getTotalPrice();

  const handleSubmitOrder = async () => {
    if (!tableId || items.length === 0) return;

    const orderData: OrderCreate = {
      tableId: tableId,
      waiterId: 1, // TODO: получать ID текущего официанта
      bookingId: bookingId ?? undefined,
      items: items.map((item) => ({
        dishId: item.dish.id,
        quantity: item.quantity,
        comment: item.comment,
      })),
    };

    try {
      const response = await createOrder.mutateAsync(orderData);
      setShowCart(false);
      setShowReceipt(true);
      setOrderId(response.id);
      clearCart();
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
    }
  };

  if (itemCount === 0 && !showReceipt) return null;

  return (
    <>
      {/* Плавающая кнопка корзины */}
      {!showReceipt && itemCount > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-8 right-8 z-40 flex items-center gap-3 bg-accent text-white px-6 py-4 rounded-full shadow-lg hover:bg-accent/90 transition-all"
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="font-semibold">Корзина ({itemCount})</span>
          <span className="bg-white text-accent px-3 py-1 rounded-full font-bold">
            {formatPrice(totalPrice)}
          </span>
        </button>
      )}

      {/* Модальное окно корзины */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Заголовок */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Ваш заказ</h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Список позиций */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.map((item) => (
                <div
                  key={item.dish.id}
                  className="bg-gray-50 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.dish.name}</h3>
                      <p className="text-sm text-gray-600">{formatPrice(item.dish.price)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.dish.id)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Управление количеством */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Количество:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-semibold min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="ml-auto font-semibold">
                      {formatPrice(item.dish.price * item.quantity)}
                    </span>
                  </div>

                  {/* Комментарий */}
                  <input
                    type="text"
                    placeholder="Комментарий к позиции (опционально)"
                    value={item.comment || ''}
                    onChange={(e) => updateComment(item.dish.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Итого и кнопки */}
            <div className="border-t p-6 space-y-4">
              <div className="flex items-center justify-between text-xl font-bold">
                <span>Итого:</span>
                <span className="text-accent">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={clearCart}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Очистить корзину
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={createOrder.isPending}
                  className="flex-1 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createOrder.isPending ? 'Оформление...' : 'Оформить заказ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно чека */}
      {showReceipt && orderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Receipt className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Заказ оформлен!</h2>
              <p className="text-gray-600">Номер заказа: #{orderId}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">Состав заказа:</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.dish.id} className="flex justify-between text-sm">
                    <span>
                      {item.dish.name} x{item.quantity}
                    </span>
                    <span className="font-semibold">
                      {formatPrice(item.dish.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                <span>Итого:</span>
                <span className="text-accent">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowReceipt(false);
                setOrderId(null);
              }}
              className="w-full px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-semibold"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
}
