using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Restaurant.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;

        public AuthController(ILogger<AuthController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Регистрация нового пользователя
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                _logger.LogInformation("Попытка регистрации пользователя: {Email}, роль: {Role}", 
                    request.Email, request.Role);

                // TODO: Реализовать полную логику регистрации через сервис
                // Временный mock ответ для разработки
                
                var user = new
                {
                    id = 1,
                    name = request.Name,
                    email = request.Email,
                    role = request.Role,
                    isActive = true,
                    createdAt = DateTime.UtcNow
                };

                var response = new
                {
                    user = user,
                    accessToken = "mock_access_token_" + Guid.NewGuid().ToString("N"),
                    refreshToken = "mock_refresh_token_" + Guid.NewGuid().ToString("N")
                };

                _logger.LogInformation("Пользователь успешно зарегистрирован: {UserId}", user.id);

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при регистрации пользователя");
                return StatusCode(500, new { message = "Ошибка при регистрации" });
            }
        }

        /// <summary>
        /// Вход в систему
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                _logger.LogInformation("Попытка входа пользователя: {Email}", request.Email);

                // TODO: Реализовать полную логику авторизации через сервис
                // Временный mock ответ для разработки
                
                // Определяем роль на основе email
                string role = "client";
                if (request.Email.Contains("admin"))
                {
                    role = "admin";
                }
                else if (request.Email.Contains("waiter"))
                {
                    role = "waiter";
                }
                
                var user = new
                {
                    id = 1,
                    name = role == "admin" ? "Admin User" : role == "waiter" ? "Waiter User" : "Test User",
                    email = request.Email,
                    role = role,
                    isActive = true,
                    createdAt = DateTime.UtcNow
                };

                var response = new
                {
                    user = user,
                    accessToken = "mock_access_token_" + Guid.NewGuid().ToString("N"),
                    refreshToken = "mock_refresh_token_" + Guid.NewGuid().ToString("N")
                };

                _logger.LogInformation("Пользователь успешно вошёл: {UserId}", user.id);

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при входе пользователя");
                return StatusCode(500, new { message = "Ошибка при входе" });
            }
        }

        /// <summary>
        /// Выход из системы
        /// </summary>
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            _logger.LogInformation("Пользователь вышел из системы");
            return NoContent();
        }

        /// <summary>
        /// Получить текущего пользователя
        /// </summary>
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            // TODO: Получить пользователя из JWT токена
            var user = new
            {
                id = 1,
                name = "Test User",
                email = "test@example.com",
                role = "администратор",
                isActive = true,
                createdAt = DateTime.UtcNow
            };

            return Ok(user);
        }

        /// <summary>
        /// Обновить токен
        /// </summary>
        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken()
        {
            var response = new
            {
                user = new
                {
                    id = 1,
                    name = "Test User",
                    email = "test@example.com",
                    role = "администратор",
                    isActive = true,
                    createdAt = DateTime.UtcNow
                },
                accessToken = "mock_access_token_" + Guid.NewGuid().ToString("N"),
                refreshToken = "mock_refresh_token_" + Guid.NewGuid().ToString("N")
            };

            return Ok(response);
        }
    }

    // DTOs
    public class RegisterRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string PasswordConfirm { get; set; } = string.Empty;
        public string Role { get; set; } = "клиент";
        public string? Phone { get; set; }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
