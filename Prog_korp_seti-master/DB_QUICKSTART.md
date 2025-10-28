# 🚀 Быстрый старт - База данных PostgreSQL

## ✅ Подключение выполнено успешно!

Ваша база данных **restaurant_db** в pgAdmin 4 успешно подключена к проекту.

## 📊 Информация о подключении

```
База данных:  restaurant_db
Пользователь: postgres
Пароль:       postgres123
Хост:         localhost:5432
```

## 🎯 Что уже работает

✅ Backend API запущен на **http://localhost:3001**  
✅ Swagger UI доступен на **http://localhost:3001/swagger**  
✅ База данных содержит 17 таблиц с тестовыми данными  
✅ Entity Framework Core настроен и работает  

## 📈 Статистика данных

- **Блюд в меню:** 1,022
- **Заказов:** 1,273  
- **Бронирований:** 297
- **Столов:** 26
- **Пользователей:** 13
- **Официантов:** 10

## 🚀 Запуск проекта

### 1. Backend (уже запущен):
```powershell
cd backend/Restaurant.Api
dotnet run
```
**Статус:** ✅ Работает на http://localhost:3001

### 2. Frontend:
```powershell
npm run dev
```
**Откроется на:** http://localhost:3000

## 🔧 Полезные инструменты

### Проверка подключения:
```powershell
python backend/test_connection.py
```

### Просмотр API:
Откройте: http://localhost:3001/swagger

### Управление через pgAdmin 4:
1. Откройте pgAdmin 4
2. Servers → localhost → Databases → restaurant_db
3. Просмотрите таблицы в разделе Tables

## 📖 Дополнительная документация

Подробная информация в файле: **DATABASE_CONNECTION.md**

---
**✨ Всё готово к работе!**
