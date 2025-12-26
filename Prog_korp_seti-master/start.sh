#!/bin/bash

# Скрипт для запуска обоих сервисов

echo "🚀 Запуск системы ресторана..."
echo ""

# Запуск backend в фоне
echo "📦 Запуск Backend API на http://localhost:3001/api"
cd "backend/Restaurant.Api"
dotnet run > backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

# Ждём запуска backend
sleep 3

# Запуск frontend в фоне
echo "🌐 Запуск Frontend на http://localhost:3000"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo "✅ Система запущена!"
echo ""
echo "📝 Доступные URL:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001/api"
echo ""
echo "📊 Тестовые аккаунты:"
echo "   Админ:     admin@restaurant.com / admin123"
echo "   Официант:  waiter1@restaurant.com / waiter123"
echo "   Клиент:    client1@restaurant.com / client123"
echo ""
echo "📁 Логи:"
echo "   Backend:  backend.log"
echo "   Frontend: frontend.log"
echo ""
echo "🛑 Для остановки: ./stop.sh"
echo ""

# Сохраняем PID
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid
