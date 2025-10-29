# 🚀 База данных PostgreSQL - Шпаргалка

## ⚡ Быстрый старт

### 1️⃣ Запуск Backend
```powershell
cd backend/Restaurant.Api
dotnet run
```
✅ Backend: http://localhost:3001  
✅ Swagger: http://localhost:3001/swagger

### 2️⃣ Запуск Frontend
```powershell
npm run dev
```
✅ Frontend: http://localhost:3000

---

## 🔌 Подключение

**База данных:** restaurant_db  
**Пользователь:** postgres  
**Пароль:** postgres123  
**Хост:** localhost:5432

**Строка подключения:**
```
Host=localhost;Port=5432;Database=restaurant_db;Username=postgres;Password=postgres123
```

---

## 🛠️ Полезные команды

### Проверка подключения:
```powershell
python backend/test_connection.py
```

### Просмотр данных:
```powershell
python backend/view_data.py
```

### EF Core миграции:
```powershell
cd backend/Restaurant.Api

# Создать миграцию
dotnet ef migrations add МояМиграция --project ..\Restaurant.Infrastructure

# Применить
dotnet ef database update --project ..\Restaurant.Infrastructure

# Список
dotnet ef migrations list --project ..\Restaurant.Infrastructure
```

---

## 📊 Таблицы в БД

| Таблица | Записей |
|---------|---------|
| users | 13 |
| waiters | 10 |
| tables | 26 |
| dishes | 1,022 |
| dish_categories | 6 |
| orders | 1,273 |
| order_items | 4,622 |
| bookings | 297 |

---

## 🔍 Интерфейсы

**pgAdmin 4:**  
Servers → localhost → restaurant_db → Schemas → public → Tables

**Swagger UI:**  
http://localhost:3001/swagger

---

## 📚 Документация

- `DATABASE_SETUP_COMPLETE.md` - Полная информация
- `DATABASE_CONNECTION.md` - Детальное описание
- `DB_QUICKSTART.md` - Быстрый старт

---

✨ **Всё готово к работе!**
