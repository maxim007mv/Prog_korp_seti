using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Restaurant.Api.Exceptions;

namespace Restaurant.Api.Middleware;

/// <summary>
/// Централизованный middleware для обработки исключений
/// </summary>
public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public GlobalExceptionHandlerMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlerMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var response = context.Response;
        response.ContentType = "application/json";

        var errorResponse = exception switch
        {
            // Бизнес-исключения
            BusinessException businessEx => new ErrorResponse
            {
                StatusCode = businessEx.StatusCode,
                ErrorCode = businessEx.ErrorCode,
                Message = businessEx.Message,
                TraceId = context.TraceIdentifier,
                Errors = businessEx is ValidationException validationEx 
                    ? validationEx.Errors 
                    : null
            },

            // Database исключения
            DbUpdateConcurrencyException => new ErrorResponse
            {
                StatusCode = 409,
                ErrorCode = "CONCURRENCY_CONFLICT",
                Message = "Данные были изменены другим пользователем. Обновите страницу и попробуйте снова.",
                TraceId = context.TraceIdentifier
            },

            DbUpdateException dbEx => new ErrorResponse
            {
                StatusCode = 409,
                ErrorCode = "DATABASE_CONFLICT",
                Message = "Конфликт при сохранении данных",
                TraceId = context.TraceIdentifier,
                Details = _environment.IsDevelopment() ? dbEx.InnerException?.Message : null
            },

            // Операция отменена (обычно timeout или отмена запроса клиентом)
            OperationCanceledException => new ErrorResponse
            {
                StatusCode = 499, // Client Closed Request
                ErrorCode = "REQUEST_CANCELLED",
                Message = "Запрос был отменен",
                TraceId = context.TraceIdentifier
            },

            // Аргументы
            ArgumentNullException argNullEx => new ErrorResponse
            {
                StatusCode = 400,
                ErrorCode = "INVALID_ARGUMENT",
                Message = $"Отсутствует обязательный параметр: {argNullEx.ParamName}",
                TraceId = context.TraceIdentifier
            },

            ArgumentException argEx => new ErrorResponse
            {
                StatusCode = 400,
                ErrorCode = "INVALID_ARGUMENT",
                Message = argEx.Message,
                TraceId = context.TraceIdentifier
            },

            // Unauthorized
            UnauthorizedAccessException => new ErrorResponse
            {
                StatusCode = 401,
                ErrorCode = "UNAUTHORIZED",
                Message = "Требуется авторизация",
                TraceId = context.TraceIdentifier
            },

            // Все остальные исключения
            _ => new ErrorResponse
            {
                StatusCode = 500,
                ErrorCode = "INTERNAL_SERVER_ERROR",
                Message = "Произошла внутренняя ошибка сервера",
                TraceId = context.TraceIdentifier,
                Details = _environment.IsDevelopment() ? exception.ToString() : null
            }
        };

        response.StatusCode = errorResponse.StatusCode;

        // Логирование
        var logLevel = errorResponse.StatusCode >= 500 ? LogLevel.Error : LogLevel.Warning;
        _logger.Log(
            logLevel,
            exception,
            "Request {Method} {Path} failed with status {StatusCode}. TraceId: {TraceId}. Error: {ErrorCode}",
            context.Request.Method,
            context.Request.Path,
            errorResponse.StatusCode,
            errorResponse.TraceId,
            errorResponse.ErrorCode
        );

        // Отправка ответа
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = _environment.IsDevelopment()
        };

        await response.WriteAsync(JsonSerializer.Serialize(errorResponse, jsonOptions));
    }
}

/// <summary>
/// Модель ответа об ошибке
/// </summary>
public class ErrorResponse
{
    public int StatusCode { get; set; }
    public string ErrorCode { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string TraceId { get; set; } = string.Empty;
    public string? Details { get; set; }
    public Dictionary<string, string[]>? Errors { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Extension method для регистрации middleware
/// </summary>
public static class GlobalExceptionHandlerMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<GlobalExceptionHandlerMiddleware>();
    }
}
