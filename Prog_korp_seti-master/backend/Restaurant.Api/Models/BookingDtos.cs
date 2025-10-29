using System.ComponentModel.DataAnnotations;

namespace Restaurant.Api.Models;

/// <summary>
/// DTO для создания нового бронирования
/// </summary>
public class CreateBookingDto
{
    /// <summary>
    /// ID стола для бронирования
    /// </summary>
    [Required(ErrorMessage = "Необходимо указать ID стола")]
    [Range(1, int.MaxValue, ErrorMessage = "ID стола должен быть положительным числом")]
    public int TableId { get; set; }

    /// <summary>
    /// Имя клиента
    /// </summary>
    [Required(ErrorMessage = "Необходимо указать имя клиента")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Имя должно содержать от 2 до 100 символов")]
    public string ClientName { get; set; } = string.Empty;

    /// <summary>
    /// Номер телефона клиента (российский формат)
    /// Допустимые форматы: +7XXXXXXXXXX, 8XXXXXXXXXX, +7 (XXX) XXX-XX-XX
    /// </summary>
    [Required(ErrorMessage = "Необходимо указать номер телефона")]
    [Phone(ErrorMessage = "Неверный формат номера телефона")]
    [StringLength(20, MinimumLength = 10, ErrorMessage = "Номер телефона должен содержать от 10 до 20 символов")]
    public string ClientPhone { get; set; } = string.Empty;

    /// <summary>
    /// Email клиента (опционально)
    /// </summary>
    [EmailAddress(ErrorMessage = "Неверный формат email")]
    public string? ClientEmail { get; set; }

    /// <summary>
    /// Время начала бронирования
    /// </summary>
    [Required(ErrorMessage = "Необходимо указать время начала бронирования")]
    public DateTime StartTime { get; set; }

    /// <summary>
    /// Время окончания бронирования
    /// </summary>
    [Required(ErrorMessage = "Необходимо указать время окончания бронирования")]
    public DateTime EndTime { get; set; }

    /// <summary>
    /// Комментарий к бронированию (опционально)
    /// </summary>
    [StringLength(500, ErrorMessage = "Комментарий не должен превышать 500 символов")]
    public string? Comment { get; set; }
}

/// <summary>
/// DTO для обновления существующего бронирования
/// </summary>
public class UpdateBookingDto
{
    /// <summary>
    /// ID стола для бронирования
    /// </summary>
    [Range(1, int.MaxValue, ErrorMessage = "ID стола должен быть положительным числом")]
    public int? TableId { get; set; }

    /// <summary>
    /// Имя клиента
    /// </summary>
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Имя должно содержать от 2 до 100 символов")]
    public string? ClientName { get; set; }

    /// <summary>
    /// Номер телефона клиента
    /// </summary>
    [Phone(ErrorMessage = "Неверный формат номера телефона")]
    [StringLength(20, MinimumLength = 10, ErrorMessage = "Номер телефона должен содержать от 10 до 20 символов")]
    public string? ClientPhone { get; set; }

    /// <summary>
    /// Время начала бронирования
    /// </summary>
    public DateTime? StartTime { get; set; }

    /// <summary>
    /// Время окончания бронирования
    /// </summary>
    public DateTime? EndTime { get; set; }

    /// <summary>
    /// Комментарий к бронированию
    /// </summary>
    [StringLength(500, ErrorMessage = "Комментарий не должен превышать 500 символов")]
    public string? Comment { get; set; }

    /// <summary>
    /// Статус бронирования (активно, завершено, отменено)
    /// </summary>
    [RegularExpression("^(активно|завершено|отменено|конвертировано)$", ErrorMessage = "Недопустимый статус")]
    public string? Status { get; set; }
}

/// <summary>
/// DTO для поиска бронирования по телефону и имени
/// </summary>
public class SearchBookingDto
{
    /// <summary>
    /// Имя клиента (частичное совпадение)
    /// </summary>
    public string? Name { get; set; }
    
    /// <summary>
    /// Номер телефона (минимум 4 цифры для поиска)
    /// </summary>
    public string? Phone { get; set; }
}

/// <summary>
/// DTO для ответа с информацией о бронировании
/// </summary>
public class BookingResponseDto
{
    public int Id { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ClientPhone { get; set; } = string.Empty;
    public string PhoneLastFour { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Comment { get; set; }
    public string Status { get; set; } = string.Empty;
    public TableInfoDto? Table { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO для информации о столе
/// </summary>
public class TableInfoDto
{
    public int Id { get; set; }
    public string Location { get; set; } = string.Empty;
    public int Seats { get; set; }
}
