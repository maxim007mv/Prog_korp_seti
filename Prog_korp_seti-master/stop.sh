#!/bin/bash

# Скрипт для остановки сервисов

echo "🛑 Остановка системы..."

if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    kill $BACKEND_PID 2>/dev/null
    rm .backend.pid
    echo "✅ Backend остановлен"
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    kill $FRONTEND_PID 2>/dev/null
    rm .frontend.pid
    echo "✅ Frontend остановлен"
fi

# Убиваем процессы на портах 3000 и 3001
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

echo "✅ Система остановлена"
