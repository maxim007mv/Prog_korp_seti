#!/usr/bin/env pwsh
# Скрипт применения миграции 003: Client-Order Cascade
# Дата: 2025-01-24

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Применение миграции 003: Client-Order Cascade" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Проверка наличия PostgreSQL
Write-Host "[1/4] Проверка подключения к PostgreSQL..." -ForegroundColor Yellow
$pgCheck = psql -h localhost -U postgres -d restaurant_db -c "SELECT version();" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка: Не удалось подключиться к PostgreSQL" -ForegroundColor Red
    Write-Host "Проверьте, что PostgreSQL запущен и доступен на localhost:5432" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PostgreSQL подключен" -ForegroundColor Green
Write-Host ""

# 2. Резервное копирование
Write-Host "[2/4] Создание резервной копии..." -ForegroundColor Yellow
$backupFile = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
pg_dump -h localhost -U postgres -d restaurant_db -f $backupFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Резервная копия создана: $backupFile" -ForegroundColor Green
} else {
    Write-Host "⚠️ Предупреждение: Не удалось создать резервную копию" -ForegroundColor Yellow
}
Write-Host ""

# 3. Применение миграции
Write-Host "[3/4] Применение миграции 003..." -ForegroundColor Yellow
$migrationPath = "backend/migrations/003_client_orders_cascade.sql"

if (Test-Path $migrationPath) {
    psql -h localhost -U postgres -d restaurant_db -f $migrationPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Миграция успешно применена" -ForegroundColor Green
    } else {
        Write-Host "❌ Ошибка при применении миграции" -ForegroundColor Red
        Write-Host "Восстановление из резервной копии..." -ForegroundColor Yellow
        psql -h localhost -U postgres -d restaurant_db -f $backupFile
        exit 1
    }
} else {
    Write-Host "❌ Файл миграции не найден: $migrationPath" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. Проверка результата
Write-Host "[4/4] Проверка применения миграции..." -ForegroundColor Yellow

$checks = @(
    @{
        Name = "Таблица admin_logs создана"
        Query = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'admin_logs';"
        Expected = 1
    },
    @{
        Name = "Поле client_id добавлено в orders"
        Query = "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'client_id';"
        Expected = 1
    },
    @{
        Name = "FK constraint fk_orders_client создан"
        Query = "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_name = 'fk_orders_client';"
        Expected = 1
    },
    @{
        Name = "Триггер автоудаления клиента создан"
        Query = "SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name = 'trg_check_client_orders_after_delete';"
        Expected = 1
    },
    @{
        Name = "Триггер логирования заказов создан"
        Query = "SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name = 'trg_log_order_deletion';"
        Expected = 1
    }
)

$allPassed = $true
foreach ($check in $checks) {
    $result = psql -h localhost -U postgres -d restaurant_db -t -c $check.Query
    $count = [int]$result.Trim()
    
    if ($count -eq $check.Expected) {
        Write-Host "  ✅ $($check.Name)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($check.Name) (ожидалось: $($check.Expected), получено: $count)" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host ""

if ($allPassed) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Миграция успешно применена!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Следующие шаги:" -ForegroundColor Cyan
    Write-Host "1. Пересобрать backend: cd backend ; dotnet build" -ForegroundColor White
    Write-Host "2. Перезапустить API: dotnet run --project Restaurant.Api" -ForegroundColor White
    Write-Host "3. Протестировать endpoint: POST /api/clients" -ForegroundColor White
    Write-Host ""
    Write-Host "Документация: CLIENT_ORDER_CASCADE_REPORT.md" -ForegroundColor Yellow
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ Миграция применена с ошибками" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Проверьте логи выше для деталей" -ForegroundColor Yellow
    exit 1
}
