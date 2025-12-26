using Serilog.Context;

namespace Restaurant.Api.Middleware;

/// <summary>
/// Middleware for managing correlation IDs across requests
/// </summary>
public class CorrelationIdMiddleware
{
    private const string CorrelationIdHeader = "X-Correlation-ID";
    private readonly RequestDelegate _next;

    public CorrelationIdMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Get or generate correlation ID
        var correlationId = context.Request.Headers[CorrelationIdHeader].FirstOrDefault()
                            ?? Guid.NewGuid().ToString();

        // Add to response headers
        context.Response.Headers[CorrelationIdHeader] = correlationId;

        // Push to Serilog LogContext for structured logging
        using (LogContext.PushProperty("CorrelationId", correlationId))
        using (LogContext.PushProperty("RequestPath", context.Request.Path))
        using (LogContext.PushProperty("RequestMethod", context.Request.Method))
        using (LogContext.PushProperty("UserAgent", context.Request.Headers["User-Agent"].ToString()))
        {
            await _next(context);
        }
    }
}

public static class CorrelationIdMiddlewareExtensions
{
    public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<CorrelationIdMiddleware>();
    }
}
