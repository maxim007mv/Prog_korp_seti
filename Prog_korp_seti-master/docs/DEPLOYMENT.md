# Deployment Guide - AI Restaurant System

## Содержание
- [Подготовка к развёртыванию](#подготовка-к-развёртыванию)
- [Frontend Deployment](#frontend-deployment)
- [Backend Deployment](#backend-deployment)
- [Database Setup](#database-setup)
- [Redis Configuration](#redis-configuration)
- [OpenAI Integration](#openai-integration)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [Production Checklist](#production-checklist)
- [Troubleshooting](#troubleshooting)

---

## Подготовка к развёртыванию

### Системные требования

#### Production Server
- **OS**: Ubuntu 22.04 LTS или Windows Server 2022
- **CPU**: 4+ cores
- **RAM**: 8GB минимум (16GB рекомендуется)
- **Storage**: 100GB+ SSD
- **Network**: Статический IP, порты 80, 443, 5432, 6379

#### Services
- **Node.js**: 18.x или выше
- **.NET**: 8.0 SDK и Runtime
- **PostgreSQL**: 15.x или выше
- **Redis**: 7.x или выше
- **Nginx**: Последняя стабильная версия

---

## Frontend Deployment

### Option 1: Vercel (Рекомендуется)

```bash
# 1. Установить Vercel CLI
npm i -g vercel

# 2. Войти в аккаунт
vercel login

# 3. Deploy
cd Prog_korp_seti-master
vercel --prod
```

**Environment Variables в Vercel:**
```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Option 2: Self-Hosted (Node.js)

```bash
# 1. Build проекта
cd Prog_korp_seti-master
npm install --production
npm run build

# 2. Настроить PM2 для process management
npm install -g pm2

# 3. Запустить через PM2
pm2 start npm --name "restaurant-frontend" -- start
pm2 save
pm2 startup

# 4. Настроить автозапуск
pm2 startup systemd
```

### Option 3: Docker

```dockerfile
# Dockerfile для frontend
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build и запуск
docker build -t restaurant-frontend .
docker run -p 3000:3000 --env-file .env restaurant-frontend
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/restaurant-frontend
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # Images optimization
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

---

## Backend Deployment

### Подготовка проекта

```bash
cd backend/Restaurant.Api

# Установить зависимости
dotnet restore

# Создать production build
dotnet publish -c Release -o ./publish

# Проверить сборку
dotnet ./publish/Restaurant.Api.dll
```

### Systemd Service (Linux)

```ini
# /etc/systemd/system/restaurant-api.service
[Unit]
Description=Restaurant API Service
After=network.target postgresql.service redis.service

[Service]
Type=notify
WorkingDirectory=/var/www/restaurant-api
ExecStart=/usr/bin/dotnet /var/www/restaurant-api/Restaurant.Api.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=restaurant-api
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://localhost:5000

[Install]
WantedBy=multi-user.target
```

```bash
# Активировать сервис
sudo systemctl daemon-reload
sudo systemctl enable restaurant-api
sudo systemctl start restaurant-api
sudo systemctl status restaurant-api
```

### Windows Service

```powershell
# Установить как Windows Service
sc.exe create RestaurantAPI binPath="C:\inetpub\restaurant-api\Restaurant.Api.exe" start=auto

# Запустить
sc.exe start RestaurantAPI

# Проверить статус
sc.exe query RestaurantAPI
```

### Nginx Reverse Proxy для Backend

```nginx
# /etc/nginx/sites-available/restaurant-api
server {
    listen 80;
    server_name api.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }
    
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }
}

# Rate limiting configuration
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
```

---

## Database Setup

### PostgreSQL Installation

```bash
# Ubuntu
sudo apt update
sudo apt install postgresql-15 postgresql-contrib-15

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Database Creation

```sql
-- Подключиться к PostgreSQL
sudo -u postgres psql

-- Создать пользователя
CREATE USER restaurant_admin WITH PASSWORD 'strong_password_here';

-- Создать базу данных
CREATE DATABASE restaurant_db OWNER restaurant_admin;

-- Дать привилегии
GRANT ALL PRIVILEGES ON DATABASE restaurant_db TO restaurant_admin;

-- Включить необходимые расширения
\c restaurant_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Применение миграций

```bash
# Основная схема
psql -U restaurant_admin -d restaurant_db -f backend/database_schema.sql

# AI и аналитика
psql -U restaurant_admin -d restaurant_db -f backend/migrations/002_ai_analytics.sql

# Проверить таблицы
psql -U restaurant_admin -d restaurant_db -c "\dt"
```

### Настройка PostgreSQL для Production

```ini
# /etc/postgresql/15/main/postgresql.conf

# Connections
max_connections = 100
shared_buffers = 2GB
effective_cache_size = 6GB

# WAL
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Query Planner
random_page_cost = 1.1
effective_io_concurrency = 200

# Logging
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_duration = on
log_statement = 'mod'
```

### Backup Setup

```bash
# Создать cron job для автоматического бэкапа
sudo crontab -e

# Добавить (backup каждый день в 2 AM)
0 2 * * * /usr/bin/pg_dump -U restaurant_admin restaurant_db | gzip > /backups/restaurant_db_$(date +\%Y\%m\%d).sql.gz

# Очистка старых бэкапов (старше 30 дней)
0 3 * * * find /backups -name "restaurant_db_*.sql.gz" -mtime +30 -delete
```

---

## Redis Configuration

### Installation

```bash
# Ubuntu
sudo apt install redis-server

# Start and enable
sudo systemctl start redis
sudo systemctl enable redis
```

### Production Config

```ini
# /etc/redis/redis.conf

# Network
bind 127.0.0.1
protected-mode yes
port 6379

# Memory
maxmemory 512mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Security
requirepass your_strong_redis_password_here

# Performance
tcp-backlog 511
timeout 0
tcp-keepalive 300
```

```bash
# Перезапустить Redis
sudo systemctl restart redis

# Проверить
redis-cli ping
```

---

## OpenAI Integration

### API Key Setup

```bash
# Получить API ключ на https://platform.openai.com/api-keys

# Добавить в backend/Restaurant.Api/appsettings.Production.json
{
  "OpenAI": {
    "ApiKey": "sk-your-actual-production-key-here",
    "Model": "gpt-4-turbo-preview",
    "MaxTokens": 2000,
    "Temperature": 0.7,
    "Organization": "your-org-id" // optional
  }
}
```

### Rate Limits & Costs

- **GPT-4 Turbo**: $0.01/1K input tokens, $0.03/1K output tokens
- **Rate Limit**: Зависит от вашего tier (обычно 10K TPM для tier 1)

### Monitoring OpenAI Usage

```csharp
// Логирование каждого запроса в AiRequests таблицу
// Dashboard: https://platform.openai.com/usage
```

---

## Environment Variables

### Frontend (.env.production)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Features
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Backend (appsettings.Production.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=restaurant_db;Username=restaurant_admin;Password=strong_password",
    "Redis": "localhost:6379,password=redis_password,ssl=False,abortConnect=False"
  },
  "OpenAI": {
    "ApiKey": "sk-production-key",
    "Model": "gpt-4-turbo-preview",
    "MaxTokens": 2000
  },
  "Jwt": {
    "SecretKey": "your-256-bit-secret-key-here-minimum-32-characters",
    "Issuer": "https://api.your-domain.com",
    "Audience": "https://your-domain.com",
    "ExpiryMinutes": 60
  },
  "RateLimiting": {
    "Ai": { "RequestsPerMinute": 10 },
    "Analytics": { "RequestsPerMinute": 30 },
    "General": { "RequestsPerMinute": 100 }
  },
  "Cors": {
    "AllowedOrigins": ["https://your-domain.com"]
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

---

## Docker Deployment

### Docker Compose для всего стека

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: restaurant_db
      POSTGRES_USER: restaurant_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/database_schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./backend/migrations/002_ai_analytics.sql:/docker-entrypoint-initdb.d/02-ai.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=restaurant_db;Username=restaurant_admin;Password=${DB_PASSWORD}
      - ConnectionStrings__Redis=redis:6379,password=${REDIS_PASSWORD}
      - OpenAI__ApiKey=${OPENAI_API_KEY}
    depends_on:
      - postgres
      - redis
    ports:
      - "5000:80"
    restart: unless-stopped

  frontend:
    build:
      context: ./Prog_korp_seti-master
      dockerfile: Dockerfile
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:80
    depends_on:
      - backend
    ports:
      - "3000:3000"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Environment файл для Docker

```bash
# .env.production
DB_PASSWORD=your_strong_db_password
REDIS_PASSWORD=your_strong_redis_password
OPENAI_API_KEY=sk-your-production-key
JWT_SECRET=your-256-bit-secret-key
```

### Запуск через Docker Compose

```bash
# Build
docker-compose -f docker-compose.production.yml build

# Start
docker-compose -f docker-compose.production.yml up -d

# Logs
docker-compose logs -f

# Stop
docker-compose -f docker-compose.production.yml down
```

---

## Production Checklist

### Security
- [ ] HTTPS настроен и работает (Let's Encrypt)
- [ ] Firewall настроен (UFW/iptables)
- [ ] Закрыт прямой доступ к БД (только localhost)
- [ ] Strong passwords для всех сервисов
- [ ] JWT secret 256+ бит
- [ ] CORS настроен правильно
- [ ] Rate limiting включён
- [ ] SQL injection protection (EF Core parameterized queries)
- [ ] XSS protection (Content Security Policy)

### Performance
- [ ] PostgreSQL настроен для production
- [ ] Redis кэширование включено
- [ ] CDN настроен для статики (Cloudflare/AWS CloudFront)
- [ ] Gzip compression включён в Nginx
- [ ] HTTP/2 включён
- [ ] Database indexes проверены
- [ ] Query performance оптимизирован

### Monitoring
- [ ] Health checks настроены
- [ ] Логирование настроено (Serilog → ELK/Seq)
- [ ] Application Insights / Prometheus
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] OpenAI usage monitoring

### Backup & Recovery
- [ ] Автоматический backup БД
- [ ] Backup rotation policy
- [ ] Disaster recovery plan
- [ ] Протестирован restore процесс

### DevOps
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated tests проходят
- [ ] Staging environment настроен
- [ ] Blue-green deployment strategy
- [ ] Rollback plan готов

---

## Troubleshooting

### Frontend не подключается к Backend

```bash
# Проверить API доступность
curl https://api.your-domain.com/health

# Проверить CORS
curl -H "Origin: https://your-domain.com" --verbose https://api.your-domain.com/api/menu

# Проверить .env
cat .env.production | grep API_URL
```

### Backend ошибки соединения с БД

```bash
# Проверить PostgreSQL
sudo systemctl status postgresql

# Проверить connection string
psql "Host=localhost;Database=restaurant_db;Username=restaurant_admin" -c "SELECT 1"

# Логи PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Redis connection failed

```bash
# Проверить Redis
redis-cli -a your_redis_password ping

# Проверить конфиг
sudo systemctl status redis
sudo cat /etc/redis/redis.conf | grep bind
```

### OpenAI API ошибки

```bash
# Проверить API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Проверить квоту
# Dashboard: https://platform.openai.com/usage

# Логи запросов
sudo journalctl -u restaurant-api | grep OpenAI
```

### High Memory Usage

```bash
# Проверить процессы
htop

# PostgreSQL
SELECT * FROM pg_stat_activity;

# Redis
redis-cli info memory

# .NET процесс
dotnet-counters monitor --process-id <PID>
```

---

## Support & Maintenance

### Logs Location
- **Frontend**: PM2 logs в `~/.pm2/logs/`
- **Backend**: `/var/log/restaurant-api/` или systemd journal
- **PostgreSQL**: `/var/log/postgresql/`
- **Nginx**: `/var/log/nginx/`

### Regular Maintenance

```bash
# Еженедельно
- Проверка disk space
- Проверка логов на ошибки
- Обновление зависимостей (security patches)

# Ежемесячно
- Анализ производительности БД
- Оптимизация queries
- Review OpenAI usage и costs
- Backup restore test
```

---

## Useful Commands

```bash
# Проверка всех сервисов
sudo systemctl status postgresql redis nginx restaurant-api

# Рестарт всего стека
sudo systemctl restart postgresql redis restaurant-api nginx

# Мониторинг ресурсов
htop
df -h
free -m

# PostgreSQL vacuum
sudo -u postgres vacuumdb -d restaurant_db --analyze --verbose

# Redis flushall (ОСТОРОЖНО!)
redis-cli -a password FLUSHALL

# Проверка SSL сертификатов
sudo certbot certificates
```

---

Для дополнительной помощи см. [AI_API.md](./AI_API.md) и [BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md).
