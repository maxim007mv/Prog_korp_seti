# Интеграция Backend для системы регистрации

## API Endpoints

### 1. POST /auth/register

Регистрация нового пользователя.

**Request:**
```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "password": "SecurePass123",
  "passwordConfirm": "SecurePass123",
  "role": "client",
  "phone": "+79991234567"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "role": "client",
    "isActive": true,
    "createdAt": "2025-10-23T10:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules:**
- `name`: минимум 2 символа, максимум 100
- `email`: валидный email, уникальный
- `password`: минимум 6 символов, должен содержать заглавные/строчные буквы и цифры
- `passwordConfirm`: должен совпадать с `password`
- `role`: enum ('client', 'waiter', 'admin')
- `phone`: обязателен для роли 'waiter', формат +[код страны][номер]

**Error Response (400):**
```json
{
  "error": "Validation error",
  "message": "Email уже используется"
}
```

**Error Response (422):**
```json
{
  "error": "Unprocessable Entity",
  "details": [
    {
      "field": "password",
      "message": "Пароль должен содержать заглавные и строчные буквы, и цифры"
    }
  ]
}
```

### 2. POST /auth/login (уже реализован)

### 3. GET /auth/me (уже реализован)

## JWT Token Structure

Access token должен содержать:

```json
{
  "userId": 1,
  "email": "ivan@example.com",
  "role": "client",
  "iat": 1698058800,
  "exp": 1698145200
}
```

**Важно:** Поле `role` обязательно для работы middleware!

## Database Schema

### Таблица Users

Необходимо добавить/обновить:

```sql
CREATE TABLE Users (
  Id INT PRIMARY KEY IDENTITY(1,1),
  Name NVARCHAR(100) NOT NULL,
  Email NVARCHAR(255) NOT NULL UNIQUE,
  PasswordHash NVARCHAR(255) NOT NULL,
  Role NVARCHAR(20) NOT NULL CHECK (Role IN ('client', 'waiter', 'admin')),
  Phone NVARCHAR(20) NULL,
  IsActive BIT NOT NULL DEFAULT 1,
  CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
  UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Индекс для быстрого поиска по email
CREATE INDEX IX_Users_Email ON Users(Email);

-- Индекс для фильтрации по роли
CREATE INDEX IX_Users_Role ON Users(Role);
```

### Constraint для телефона официантов

```sql
ALTER TABLE Users
ADD CONSTRAINT CK_Waiter_Phone 
CHECK (
  (Role != 'waiter') OR 
  (Role = 'waiter' AND Phone IS NOT NULL AND LEN(Phone) > 0)
);
```

## Backend Implementation (C#/.NET)

### 1. Model

```csharp
public class RegisterRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 6)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", 
        ErrorMessage = "Пароль должен содержать заглавные и строчные буквы, и цифры")]
    public string Password { get; set; }

    [Required]
    [Compare("Password", ErrorMessage = "Пароли не совпадают")]
    public string PasswordConfirm { get; set; }

    [Required]
    [RegularExpression("^(client|waiter|admin)$")]
    public string Role { get; set; }

    [Phone]
    public string? Phone { get; set; }
}
```

### 2. Controller

```csharp
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    [HttpPost("register")]
    public async Task<ActionResult<RegisterResponse>> Register(
        [FromBody] RegisterRequest request)
    {
        // Валидация телефона для официантов
        if (request.Role == "waiter" && string.IsNullOrEmpty(request.Phone))
        {
            return BadRequest(new 
            { 
                error = "Validation error",
                message = "Телефон обязателен для официантов" 
            });
        }

        // Проверка существующего email
        if (await _authService.EmailExistsAsync(request.Email))
        {
            return BadRequest(new 
            { 
                error = "Validation error",
                message = "Email уже используется" 
            });
        }

        // Хеширование пароля
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // Создание пользователя
        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = passwordHash,
            Role = request.Role,
            Phone = request.Phone,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _authService.CreateUserAsync(user);

        // Генерация токенов
        var accessToken = _authService.GenerateAccessToken(user);
        var refreshToken = _authService.GenerateRefreshToken(user);

        // Сохранение refresh token
        await _authService.SaveRefreshTokenAsync(user.Id, refreshToken);

        // Установка cookie
        Response.Cookies.Append("accessToken", accessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });

        return Ok(new RegisterResponse
        {
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            },
            AccessToken = accessToken,
            RefreshToken = refreshToken
        });
    }
}
```

### 3. JWT Service

```csharp
public class JwtService
{
    private readonly IConfiguration _configuration;

    public string GenerateAccessToken(User user)
    {
        var claims = new[]
        {
            new Claim("userId", user.Id.ToString()),
            new Claim("email", user.Email),
            new Claim("role", user.Role), // ВАЖНО!
            new Claim(JwtRegisteredClaimNames.Iat, 
                DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString())
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]));
        
        var credentials = new SigningCredentials(
            key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

## CORS Configuration

Убедитесь, что CORS настроен для работы с cookies:

```csharp
services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder
            .WithOrigins("http://localhost:3000")
            .AllowCredentials()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
```

## Testing

### Postman/cURL

```bash
# Регистрация клиента
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Иван Клиент",
    "email": "client@test.com",
    "password": "TestPass123",
    "passwordConfirm": "TestPass123",
    "role": "client"
  }'

# Регистрация официанта (с телефоном)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Петр Официант",
    "email": "waiter@test.com",
    "password": "TestPass123",
    "passwordConfirm": "TestPass123",
    "role": "waiter",
    "phone": "+79991234567"
  }'

# Регистрация администратора
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Админ Админович",
    "email": "admin@test.com",
    "password": "TestPass123",
    "passwordConfirm": "TestPass123",
    "role": "admin"
  }'
```

## Security Checklist

- [ ] Пароли хешируются с использованием BCrypt или Argon2
- [ ] Email уникален в базе данных
- [ ] JWT токены содержат поле `role`
- [ ] Access token устанавливается в HttpOnly cookie
- [ ] CORS настроен правильно
- [ ] Валидация на стороне сервера дублирует клиентскую
- [ ] Rate limiting для endpoint регистрации
- [ ] CAPTCHA защита (опционально)
- [ ] Email верификация (опционально)

## Common Issues

### 1. Middleware не видит роль

**Проблема:** JWT токен не содержит поле `role`

**Решение:** Убедитесь, что при генерации токена добавляется claim:
```csharp
new Claim("role", user.Role)
```

### 2. CORS ошибка при отправке credentials

**Проблема:** `Access-Control-Allow-Credentials` не установлен

**Решение:** 
```csharp
builder.WithOrigins("http://localhost:3000")
       .AllowCredentials()  // Важно!
```

### 3. Cookie не устанавливается

**Проблема:** Frontend и Backend на разных доменах

**Решение:** Используйте одинаковые домены или настройте SameSite=None:
```csharp
new CookieOptions
{
    HttpOnly = true,
    Secure = true,
    SameSite = SameSiteMode.None  // Для cross-origin
}
```
