'use client';

import { useState } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, Send } from 'lucide-react';
import { useOrderCart } from '@/lib/contexts/OrderCartContext';
import { useCreateOrder } from '@/lib/hooks/useOrders';
import type { OrderCreate } from '@/types';

export function OrderCart() {
  const {
    items,
    bookingId,
    tableId,
    updateQuantity,
    removeItem,
    updateComment,
    clearCart,
    getTotalPrice,
    getItemCount,
  } = useOrderCart();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const createOrder = useCreateOrder();

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      alert('Корзина пуста');
      return;
    }

    if (!tableId) {
      alert('Не указан стол. Пожалуйста, вернитесь к бронированию.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Отправляем в PascalCase для .NET бэкенда
      const orderData = {
        TableId: tableId,
        WaiterId: 0, // Бэкенд автоматически назначит первого доступного официанта
        BookingId: bookingId || undefined,
        Items: items.map((item) => ({
          DishId: item.dish.id,
          Quantity: item.quantity,
          Comment: item.comment || undefined,
        })),
      };

      const response = await createOrder.mutateAsync(orderData as any);
      
      if (response && response.id) {
        setOrderId(response.id);
        setShowReceipt(true);
        setIsOpen(false);
      }
    } catch (error: any) {
      console.error('Ошибка создания заказа:', error);
      alert('Ошибка при создании заказа: ' + (error.message || 'Неизвестная ошибка'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemCount = getItemCount();
  const totalPrice = getTotalPrice();

  if (showReceipt && orderId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">✅ Заказ оформлен!</h2>
              <button
                onClick={() => {
                  setShowReceipt(false);
                  clearCart();
                  window.location.href = '/';
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-semibold">Номер заказа: #{orderId}</p>
              <p className="text-green-700 text-sm mt-2">
                Ваш заказ передан на кухню. Ожидайте подачи блюд.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold mb-4">Ваш заказ:</h3>
              {items.map((item) => (
                <div key={item.dish.id} className="flex justify-between mb-3 pb-3 border-b">
                  <div className="flex-1">
                    <p className="font-semibold">{item.dish.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × {item.dish.price} ₽
                    </p>
                    {item.comment && (
                      <p className="text-xs text-gray-500 mt-1">💬 {item.comment}</p>
                    )}
                  </div>
                  <div className="font-bold">
                    {(item.quantity * item.dish.price).toFixed(2)} ₽
                  </div>
                </div>
              ))}
              <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t-2">
                <span>Итого:</span>
                <span>{totalPrice.toFixed(2)} ₽</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowReceipt(false);
                clearCart();
                window.location.href = '/';
              }}
              className="w-full mt-6 px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Кнопка корзины */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-yellow-400 text-black p-4 rounded-full shadow-lg hover:bg-yellow-500 transition-all z-40"
      >
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {/* Модальное окно корзины */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Корзина заказа</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Корзина пуста</p>
                  <p className="text-sm mt-2">Добавьте блюда из меню</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.dish.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{item.dish.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{item.dish.price} ₽</p>
                          <input
                            type="text"
                            placeholder="Комментарий к блюду..."
                            value={item.comment || ''}
                            onChange={(e) => updateComment(item.dish.id, e.target.value)}
                            className="mt-2 w-full px-3 py-1 text-sm border rounded"
                          />
                        </div>

                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}
                              className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-lg w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}
                              className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.dish.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="font-bold text-sm">
                            {(item.quantity * item.dish.price).toFixed(2)} ₽
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Итого:</span>
                      <span>{totalPrice.toFixed(2)} ₽</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {itemCount} {itemCount === 1 ? 'позиция' : 'позиции'}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>Оформление...</>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Оформить заказ
                        </>
                      )}
                    </button>
                    <button
                      onClick={clearCart}
                      className="px-6 py-3 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition"
                    >
                      Очистить
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
