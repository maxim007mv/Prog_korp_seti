namespace Restaurant.Api.Exceptions;

/// <summary>
/// Базовый класс для бизнес-исключений приложения
/// </summary>
public abstract class BusinessException : Exception
{
    public int StatusCode { get; }
    public string ErrorCode { get; }

    protected BusinessException(string message, int statusCode, string errorCode) 
        : base(message)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
    }
}

/// <summary>
/// Ресурс не найден (404)
/// </summary>
public class NotFoundException : BusinessException
{
    public NotFoundException(string resourceName, object key)
        : base($"{resourceName} с ID '{key}' не найден", 404, "NOT_FOUND")
    {
    }

    public NotFoundException(string message)
        : base(message, 404, "NOT_FOUND")
    {
    }
}

/// <summary>
/// Конфликт данных (409)
/// </summary>
public class ConflictException : BusinessException
{
    public ConflictException(string message)
        : base(message, 409, "CONFLICT")
    {
    }
}

/// <summary>
/// Ошибка валидации (400)
/// </summary>
public class ValidationException : BusinessException
{
    public Dictionary<string, string[]> Errors { get; }

    public ValidationException(string message, Dictionary<string, string[]>? errors = null)
        : base(message, 400, "VALIDATION_ERROR")
    {
        Errors = errors ?? new Dictionary<string, string[]>();
    }
}

/// <summary>
/// Недостаточно прав (403)
/// </summary>
public class ForbiddenException : BusinessException
{
    public ForbiddenException(string message = "Недостаточно прав для выполнения операции")
        : base(message, 403, "FORBIDDEN")
    {
    }
}

/// <summary>
/// Неавторизован (401)
/// </summary>
public class UnauthorizedException : BusinessException
{
    public UnauthorizedException(string message = "Требуется авторизация")
        : base(message, 401, "UNAUTHORIZED")
    {
    }
}
