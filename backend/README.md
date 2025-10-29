# Restaurant Backend — инструкция по запуску (Windows)

Эта инструкция поможет быстро поднять бэкенд (ASP.NET Core + PostgreSQL) локально.

## Предварительные требования

- .NET SDK 8.x
- PostgreSQL 13+ (локально на `localhost:5432` или свой сервер)
- Windows PowerShell (5.1+) — команды ниже для PowerShell
- Python 3.10+ (опционально, только если будете импортировать блюда через скрипт)

## Структура

- Точка входа API: `backend/Restaurant.Api/Restaurant.Api.csproj`
- Контекст EF Core: `backend/Restaurant.Infrastructure/Persistence/AppDbContext.cs`
- Миграции EF: `backend/Restaurant.Infrastructure/Migrations/`
- Импорт блюд (опционально): корень репо — `import_dishes.py`

## Конфигурация подключения к БД

По умолчанию используется строка подключения `ConnectionStrings:DefaultConnection` из `Restaurant.Api/appsettings.Development.json`:

```
Host=localhost;Port=5432;Database=restaurant_db;Username=postgres;Password=postgres123
```

Вы можете переопределить строку подключения переменной окружения `DB_CONNECTION`.

Пример (PowerShell, текущая сессия):

```powershell
$env:DB_CONNECTION = "Host=localhost;Port=5432;Database=restaurant_db;Username=postgres;Password=postgres123"
```

## Подготовка базы данных

Рекомендуемый способ — EF Core миграции. Это гарантирует полное соответствие доменной модели и схемы БД.

1) Убедитесь, что PostgreSQL запущен и доступен, пользователь и пароль корректны.
2) Примените миграции EF Core:

```powershell
Set-Location "D:\korporative_system\backend"
# (опционально) Установить dotnet-ef, если не установлен
# dotnet tool install -g dotnet-ef

dotnet ef database update --project "Restaurant.Infrastructure" --startup-project "Restaurant.Api"
```

Не рекомендуется применять `database_schema.sql` напрямую — в нём другая модель статусов и дополнительные объекты; схема может конфликтовать с EF Core.

## Запуск API

```powershell
Set-Location "D:\korporative_system\backend\Restaurant.Api"
dotnet run
```

Ожидаемый вывод:

```
Now listening on: http://localhost:5235
Hosting environment: Development
```

## Быстрая проверка

- Health-check:
  - http://localhost:5235/api/health
- Меню (категории + блюда):
  - http://localhost:5235/api/menu

CORS по умолчанию разрешает фронтенд на `http://localhost:3000`.

## Импорт блюд (опционально)

Скрипт `import_dishes.py` заполняет таблицы `dish_categories` и `dishes` из JSON (`parsed_dishes.ru.improved.json`). Требуется пакет `psycopg2`.

```powershell
Set-Location "D:\korporative_system"
# Если есть виртуальное окружение .venv
# .\.venv\Scripts\Activate.ps1
# Установить зависимости при необходимости:
# pip install psycopg2-binary

python .\import_dishes.py
```

После импорта проверьте `GET /api/menu` — должны прийти категории и блюда.

## Частые проблемы и решения

- Не запускается проект командой `dotnet run` из корня:
  - Запускайте с явным csproj: 
    ```powershell
    dotnet run --project "D:\korporative_system\backend\Restaurant.Api\Restaurant.Api.csproj"
    ```

- Ошибка подключения к Postgres (например, `28P01 invalid_password` или `Connection refused`):
  - Проверьте, что PostgreSQL запущен и доступен по `localhost:5432`.
  - Уточните логин/пароль/БД в `appsettings.Development.json` или в переменной `DB_CONNECTION`.

- Порт 5235 занят:
  - Временно задайте другой адрес:
    ```powershell
    $env:ASPNETCORE_URLS = "http://localhost:5236"; dotnet run --project "D:\korporative_system\backend\Restaurant.Api\Restaurant.Api.csproj"
    ```

- Предупреждение EF о множественных Include (MultipleCollectionIncludeWarning):
  - Это предупреждение производительности. При необходимости можно настроить разделение запроса:
    - В `AddDbContext` добавить `options.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)`.

## Примечания

- Миграции уже содержат полную схему. Скрипт `mark_migration_as_applied.py` используется только для редких случаев принудительной синхронизации и обычно не требуется.
- Не смешивайте вручную применённый `database_schema.sql` и EF-миграции — придерживайтесь одного источника истины (рекомендуем EF-миграции).
