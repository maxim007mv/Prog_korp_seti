using System.Net;
using System.Text.Json;
using Restaurant.Domain.Exceptions;

namespace Restaurant.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Произошла необработанная ошибка: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message, errors) = exception switch
        {
            NotFoundException notFoundEx => (
                HttpStatusCode.NotFound,
                notFoundEx.Message,
                null as Dictionary<string, string[]>
            ),
            ValidationException validationEx => (
                HttpStatusCode.BadRequest,
                validationEx.Message,
                validationEx.Errors
            ),
            BadRequestException badRequestEx => (
                HttpStatusCode.BadRequest,
                badRequestEx.Message,
                null as Dictionary<string, string[]>
            ),
            UnauthorizedAccessException => (
                HttpStatusCode.Unauthorized,
                "Доступ запрещен. Пожалуйста, авторизуйтесь",
                null as Dictionary<string, string[]>
            ),
            _ => (
                HttpStatusCode.InternalServerError,
                "Внутренняя ошибка сервера. Пожалуйста, попробуйте позже",
                null as Dictionary<string, string[]>
            )
        };

        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            error = message,
            statusCode = (int)statusCode,
            timestamp = DateTime.UtcNow,
            errors = errors
        };

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };

        return context.Response.WriteAsJsonAsync(response, options);
    }
}

public static class ExceptionHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseExceptionHandlingMiddleware(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<ExceptionHandlingMiddleware>();
    }
}
