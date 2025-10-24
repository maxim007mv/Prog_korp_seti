# Скрипт для проверки подключения к PostgreSQL
Write-Host "Проверка подключения к базе данных PostgreSQL..." -ForegroundColor Cyan

# Параметры подключения
$Server = "localhost"
$Port = 5432
$Database = "restaurant_db"
$Username = "postgres"
$Password = "postgres123"

# Проверка доступности PostgreSQL
Write-Host "`nШаг 1: Проверка порта PostgreSQL..." -ForegroundColor Yellow
try {
    $connection = Test-NetConnection -ComputerName $Server -Port $Port -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "✓ PostgreSQL доступен на порту $Port" -ForegroundColor Green
    } else {
        Write-Host "✗ PostgreSQL недоступен на порту $Port" -ForegroundColor Red
        Write-Host "  Убедитесь, что PostgreSQL запущен" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "✗ Ошибка проверки подключения: $_" -ForegroundColor Red
    exit 1
}

# Проверка наличия psql
Write-Host "`nШаг 2: Проверка наличия psql..." -ForegroundColor Yellow
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if ($psqlPath) {
    Write-Host "✓ psql найден: $($psqlPath.Source)" -ForegroundColor Green
    
    # Проверка подключения через psql
    Write-Host "`nШаг 3: Проверка подключения к базе данных..." -ForegroundColor Yellow
    $env:PGPASSWORD = $Password
    $result = & psql -U $Username -h $Server -p $Port -d $Database -c "\dt" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Успешное подключение к базе данных $Database" -ForegroundColor Green
        Write-Host "`nТаблицы в базе данных:" -ForegroundColor Cyan
        Write-Host $result
    } else {
        Write-Host "✗ Ошибка подключения к базе данных" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
} else {
    Write-Host "⚠ psql не найден в PATH" -ForegroundColor Yellow
    Write-Host "  Используйте .NET для проверки подключения через Entity Framework" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Строка подключения для appsettings.json:" -ForegroundColor Cyan
Write-Host "Host=$Server;Port=$Port;Database=$Database;Username=$Username;Password=$Password" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan
