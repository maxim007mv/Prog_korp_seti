using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Restaurant.Api.Models;
using Restaurant.Api.Utilities;
using Restaurant.Infrastructure.Persistence;

namespace Restaurant.Api.Controllers;

/// <summary>
/// Контроллер для управления бронированиями столов
/// </summary>
[ApiController]
[Route("api/bookings")]
public class BookingController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<BookingController> _logger;

    public BookingController(AppDbContext context, ILogger<BookingController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Поиск бронирований по номеру телефона и/или имени клиента
    /// Поддерживает частичное совпадение и поиск по последним 4 цифрам телефона (ПЗ-3)
    /// </summary>
    /// <param name="phone">Номер телефона (минимум 4 цифры)</param>
    /// <param name="name">Имя клиента (опционально, частичное совпадение)</param>
    /// <returns>Список найденных бронирований</returns>
    /// <response code="200">Возвращает список бронирований (может быть пустым)</response>
    /// <response code="400">Некорректные параметры запроса</response>
    [HttpGet("search")]
    [ProducesResponseType(typeof(List<BookingResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SearchBookings([FromQuery] string? phone, [FromQuery] string? name)
    {
        // Валидация: хотя бы один параметр должен быть указан
        if (string.IsNullOrWhiteSpace(phone) && string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new
            {
                error = "Необходимо указать хотя бы один параметр: phone или name",
                message = "Please provide at least one search parameter: phone or name"
            });
        }

        // Валидация телефона
        if (!string.IsNullOrWhiteSpace(phone) && !phone.IsValidPhone(minDigits: 4))
        {
            return BadRequest(new
            {
                error = "Номер телефона должен содержать минимум 4 цифры",
                message = "Phone number must contain at least 4 digits"
            });
        }

        try
        {
            // Нормализация входных данных
            var normalizedPhone = phone?.NormalizePhone() ?? string.Empty;
            var normalizedName = name?.Trim().ToLower() ?? string.Empty;

            _logger.LogInformation(
                "Поиск бронирований: phone={Phone}, name={Name}",
                normalizedPhone,
                normalizedName
            );

            // Построение запроса
            var query = _context.Bookings
                .AsNoTracking()
                .Include(b => b.Table)
                .Where(b => b.Status == "активно"); // Ищем только активные бронирования

            // Фильтр по телефону (поиск по частичному совпадению)
            if (!string.IsNullOrWhiteSpace(normalizedPhone))
            {
                // Используем ILIKE для case-insensitive поиска в PostgreSQL
                // Ищем по последним цифрам или полному совпадению
                query = query.Where(b => 
                    EF.Functions.ILike(b.ClientPhone, $"%{normalizedPhone}%") ||
                    EF.Functions.ILike(b.ClientPhone, $"%{normalizedPhone}")
                );
            }

            // Фильтр по имени (частичное совпадение, case-insensitive)
            if (!string.IsNullOrWhiteSpace(normalizedName))
            {
                query = query.Where(b => 
                    EF.Functions.ILike(b.ClientName, $"%{normalizedName}%")
                );
            }

            // Выполняем запрос с сортировкой по дате (ближайшие первыми)
            var bookings = await query
                .OrderBy(b => b.StartTime)
                .Take(50) // Ограничиваем результаты для производительности
                .ToListAsync();

            // Маппинг в DTO
            var result = bookings.Select(b => new BookingResponseDto
            {
                Id = b.Id,
                ClientName = b.ClientName,
                ClientPhone = b.ClientPhone,
                PhoneLastFour = b.ClientPhone.GetLastDigits(4),
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                Comment = b.Comment,
                Status = MapStatusToEnglish(b.Status),
                Table = b.Table != null ? new TableInfoDto
                {
                    Id = b.Table.Id,
                    Location = b.Table.Location,
                    Seats = b.Table.Seats
                } : null,
                CreatedAt = b.CreatedAt
            }).ToList();

            _logger.LogInformation("Найдено бронирований: {Count}", result.Count);

            // Возвращаем результат (даже если пустой список)
            return Ok(new
            {
                count = result.Count,
                bookings = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при поиске бронирований");
            return StatusCode(500, new
            {
                error = "Внутренняя ошибка сервера",
                message = "An error occurred while searching bookings"
            });
        }
    }

    /// <summary>
    /// Получить бронирование по ID
    /// </summary>
    /// <param name="id">ID бронирования</param>
    /// <returns>Детали бронирования</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(BookingResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBooking(int id)
    {
        var booking = await _context.Bookings
            .AsNoTracking()
            .Include(b => b.Table)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null)
        {
            return NotFound(new { error = "Бронирование не найдено" });
        }

        var result = new BookingResponseDto
        {
            Id = booking.Id,
            ClientName = booking.ClientName,
            ClientPhone = booking.ClientPhone,
            PhoneLastFour = booking.ClientPhone.GetLastDigits(4),
            StartTime = booking.StartTime,
            EndTime = booking.EndTime,
            Comment = booking.Comment,
            Status = MapStatusToEnglish(booking.Status),
            Table = booking.Table != null ? new TableInfoDto
            {
                Id = booking.Table.Id,
                Location = booking.Table.Location,
                Seats = booking.Table.Seats
            } : null,
            CreatedAt = booking.CreatedAt
        };

        return Ok(result);
    }

    /// <summary>
    /// Получить все активные бронирования
    /// </summary>
    /// <returns>Список всех активных бронирований</returns>
    [HttpGet]
    [ProducesResponseType(typeof(List<BookingResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllBookings([FromQuery] string? status = null)
    {
        var query = _context.Bookings
            .AsNoTracking()
            .Include(b => b.Table)
            .OrderBy(b => b.StartTime)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            // Конвертируем английский статус в русский для поиска в БД
            var russianStatus = MapStatusToRussian(status);
            query = query.Where(b => b.Status.ToLower() == russianStatus.ToLower());
        }

        var bookings = await query.ToListAsync();

        var result = bookings.Select(b => new BookingResponseDto
        {
            Id = b.Id,
            ClientName = b.ClientName,
            ClientPhone = b.ClientPhone,
            PhoneLastFour = b.ClientPhone.GetLastDigits(4),
            StartTime = b.StartTime,
            EndTime = b.EndTime,
            Comment = b.Comment,
            Status = MapStatusToEnglish(b.Status),
            Table = b.Table != null ? new TableInfoDto
            {
                Id = b.Table.Id,
                Location = b.Table.Location,
                Seats = b.Table.Seats
            } : null,
            CreatedAt = b.CreatedAt
        }).ToList();

        return Ok(result);
    }

    /// <summary>
    /// Создать новое бронирование стола (ПЗ-3)
    /// Валидирует время, проверяет конфликты, нормализует телефон
    /// </summary>
    /// <param name="dto">Данные для создания бронирования</param>
    /// <returns>Созданное бронирование</returns>
    /// <response code="201">Бронирование успешно создано</response>
    /// <response code="400">Ошибка валидации</response>
    /// <response code="404">Стол не найден</response>
    /// <response code="409">Конфликт времени бронирования</response>
    [HttpPost]
    [ProducesResponseType(typeof(BookingResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        _logger.LogInformation(
            "Начало создания бронирования. Входные данные: TableId={TableId}, ClientName={ClientName}, ClientPhone={ClientPhone}, StartTime={StartTime}, EndTime={EndTime}",
            dto?.TableId, dto?.ClientName, dto?.ClientPhone, dto?.StartTime, dto?.EndTime);

        try
        {
            // Проверка входных данных
            if (dto == null)
            {
                _logger.LogWarning("CreateBooking: DTO is null");
                return BadRequest(new
                {
                    error = "Данные бронирования не переданы",
                    message = "Booking data is required"
                });
            }

            _logger.LogDebug("CreateBooking: Начинаем валидацию времени бронирования");

            // Нормализуем DateTime: если пришло без таймзоны (Unspecified), считаем что это UTC
            var startTimeUtc = dto.StartTime.Kind == DateTimeKind.Unspecified 
                ? DateTime.SpecifyKind(dto.StartTime, DateTimeKind.Utc) 
                : dto.StartTime.ToUniversalTime();
                
            var endTimeUtc = dto.EndTime.Kind == DateTimeKind.Unspecified 
                ? DateTime.SpecifyKind(dto.EndTime, DateTimeKind.Utc) 
                : dto.EndTime.ToUniversalTime();

            // 1. Валидация времени бронирования
            if (endTimeUtc <= startTimeUtc)
            {
                _logger.LogWarning(
                    "CreateBooking: Некорректное время бронирования. StartTime={StartTime}, EndTime={EndTime}",
                    startTimeUtc, endTimeUtc);
                return BadRequest(new
                {
                    error = "Время окончания должно быть позже времени начала",
                    field = "endTime"
                });
            }

            // Бронирование должно быть в будущем
            if (startTimeUtc < DateTime.UtcNow.AddMinutes(-5)) // 5 минут допуска
            {
                _logger.LogWarning(
                    "CreateBooking: Время начала в прошлом. StartTime={StartTime}, CurrentTime={CurrentTime}",
                    startTimeUtc, DateTime.UtcNow);
                return BadRequest(new
                {
                    error = "Время начала бронирования должно быть в будущем",
                    field = "startTime"
                });
            }

            // Длительность должна быть кратна 30 минутам
            var duration = (endTimeUtc - startTimeUtc).TotalMinutes;
            if (duration % 30 != 0 || duration < 30)
            {
                _logger.LogWarning(
                    "CreateBooking: Некорректная длительность. Duration={Duration} минут",
                    duration);
                return BadRequest(new
                {
                    error = "Длительность бронирования должна быть кратна 30 минутам (минимум 30 минут)",
                    field = "duration",
                    actualDuration = duration
                });
            }

            _logger.LogDebug("CreateBooking: Валидация времени пройдена. Начинаем валидацию телефона");

            // 2. Нормализация и валидация телефона
            var normalizedPhone = PhoneNormalizer.NormalizeWithCountryCode(dto.ClientPhone);
            if (!PhoneNormalizer.IsValid(dto.ClientPhone))
            {
                _logger.LogWarning(
                    "CreateBooking: Неверный формат телефона. ClientPhone={ClientPhone}",
                    dto.ClientPhone);
                return BadRequest(new
                {
                    error = "Неверный формат российского номера телефона",
                    field = "clientPhone",
                    expected = "+7 (XXX) XXX-XX-XX или 8XXXXXXXXXX"
                });
            }

            _logger.LogDebug(
                "CreateBooking: Телефон нормализован. Original={Original}, Normalized={Normalized}",
                dto.ClientPhone, normalizedPhone);

            // 3. Проверка существования стола
            _logger.LogDebug("CreateBooking: Проверяем существование стола с ID={TableId}", dto.TableId);

            var table = await _context.Tables
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == dto.TableId && t.IsActive);

            if (table == null)
            {
                _logger.LogWarning(
                    "CreateBooking: Стол не найден или неактивен. TableId={TableId}. Проверяем все активные столы в БД",
                    dto.TableId);

                // Дополнительная диагностика - проверим все активные столы
                var activeTables = await _context.Tables
                    .Where(t => t.IsActive)
                    .Select(t => new { t.Id, t.Location, t.Seats })
                    .ToListAsync();

                _logger.LogInformation(
                    "CreateBooking: Найдено {Count} активных столов: {Tables}",
                    activeTables.Count,
                    string.Join(", ", activeTables.Select(t => $"ID:{t.Id}({t.Location}-{t.Seats}мест)")));

                return NotFound(new
                {
                    error = "Стол не найден или неактивен",
                    tableId = dto.TableId,
                    availableTables = activeTables.Select(t => new { t.Id, t.Location, t.Seats })
                });
            }

            _logger.LogDebug(
                "CreateBooking: Стол найден. TableId={TableId}, Location={Location}, Seats={Seats}",
                table.Id, table.Location, table.Seats);

            // 4. Проверка конфликтов бронирований
            _logger.LogDebug("CreateBooking: Проверяем конфликты бронирований для стола {TableId}", dto.TableId);

            var hasConflict = await _context.Bookings
                .AnyAsync(b =>
                    b.TableId == dto.TableId &&
                    b.Status == "активно" &&
                    (
                        (startTimeUtc >= b.StartTime && startTimeUtc < b.EndTime) ||
                        (endTimeUtc > b.StartTime && endTimeUtc <= b.EndTime) ||
                        (startTimeUtc <= b.StartTime && endTimeUtc >= b.EndTime)
                    )
                );

            if (hasConflict)
            {
                _logger.LogWarning(
                    "CreateBooking: Конфликт времени бронирования. TableId={TableId}, StartTime={StartTime}, EndTime={EndTime}",
                    dto.TableId, startTimeUtc, endTimeUtc);

                // Получим детали конфликтующих бронирований для диагностики
                var conflictingBookings = await _context.Bookings
                    .Where(b =>
                        b.TableId == dto.TableId &&
                        b.Status == "активно" &&
                        (
                            (startTimeUtc >= b.StartTime && startTimeUtc < b.EndTime) ||
                            (endTimeUtc > b.StartTime && endTimeUtc <= b.EndTime) ||
                            (startTimeUtc <= b.StartTime && endTimeUtc >= b.EndTime)
                        )
                    )
                    .Select(b => new { b.Id, b.ClientName, b.StartTime, b.EndTime })
                    .ToListAsync();

                _logger.LogInformation(
                    "CreateBooking: Найдено {Count} конфликтующих бронирований: {Bookings}",
                    conflictingBookings.Count,
                    string.Join(", ", conflictingBookings.Select(b => $"ID:{b.Id}({b.ClientName}:{b.StartTime}-{b.EndTime})")));

                return Conflict(new
                {
                    error = "Стол уже забронирован на указанное время",
                    tableId = dto.TableId,
                    requestedTime = new { start = startTimeUtc, end = endTimeUtc },
                    conflictingBookings = conflictingBookings
                });
            }

            _logger.LogDebug("CreateBooking: Конфликтов не найдено. Создаем бронирование");

            // 5. Поиск или создание клиента
            _logger.LogDebug("CreateBooking: Проверяем существование клиента с телефоном {Phone}", normalizedPhone);
            
            var existingClient = await _context.Clients
                .FirstOrDefaultAsync(c => c.Phone == normalizedPhone);

            int? clientId = null;
            
            if (existingClient != null)
            {
                _logger.LogInformation(
                    "CreateBooking: Найден существующий клиент ID={ClientId}, Name={FirstName} {LastName}",
                    existingClient.Id, existingClient.FirstName, existingClient.LastName);
                clientId = existingClient.Id;
            }
            else
            {
                // Создаём нового клиента
                var nameParts = dto.ClientName.Trim().Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                var newClient = new Restaurant.Domain.Entities.Client
                {
                    FirstName = nameParts.Length > 0 ? nameParts[0] : dto.ClientName.Trim(),
                    LastName = nameParts.Length > 1 ? nameParts[1] : null,
                    Phone = normalizedPhone,
                    RegistrationDate = DateTime.UtcNow,
                    LoyaltyPoints = 0
                };

                _context.Clients.Add(newClient);
                await _context.SaveChangesAsync();
                
                clientId = newClient.Id;
                _logger.LogInformation(
                    "CreateBooking: Создан новый клиент ID={ClientId}, Name={FirstName} {LastName}, Phone={Phone}",
                    newClient.Id, newClient.FirstName, newClient.LastName, newClient.Phone);
            }

            // 6. Создание бронирования
            var booking = new Restaurant.Domain.Entities.Booking
            {
                TableId = dto.TableId,
                ClientId = clientId,
                ClientName = dto.ClientName.Trim(),
                ClientPhone = normalizedPhone,
                StartTime = startTimeUtc,
                EndTime = endTimeUtc,
                Comment = dto.Comment?.Trim(),
                Status = "активно",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "CreateBooking: Бронирование успешно создано. ID={BookingId}, ClientId={ClientId}, ClientName={ClientName}, TableId={TableId}, Time={StartTime}-{EndTime}",
                booking.Id, booking.ClientId, booking.ClientName, booking.TableId, booking.StartTime, booking.EndTime);

            // 7. Загружаем связанные данные для ответа
            var createdBooking = await _context.Bookings
                .AsNoTracking()
                .Include(b => b.Table)
                .FirstOrDefaultAsync(b => b.Id == booking.Id);

            if (createdBooking == null)
            {
                _logger.LogError("CreateBooking: Не удалось загрузить созданное бронирование с ID={BookingId}", booking.Id);
                return StatusCode(500, new
                {
                    error = "Бронирование создано, но не удалось получить данные",
                    bookingId = booking.Id
                });
            }

            if (createdBooking.Table == null)
            {
                _logger.LogError("CreateBooking: Созданное бронирование ID={BookingId} не содержит данных стола", booking.Id);
                return StatusCode(500, new
                {
                    error = "Бронирование создано, но данные стола недоступны",
                    bookingId = booking.Id
                });
            }

            var response = new BookingResponseDto
            {
                Id = createdBooking.Id,
                ClientName = createdBooking.ClientName,
                ClientPhone = createdBooking.ClientPhone,
                PhoneLastFour = PhoneNormalizer.GetLastDigits(createdBooking.ClientPhone, 4),
                StartTime = createdBooking.StartTime,
                EndTime = createdBooking.EndTime,
                Comment = createdBooking.Comment,
                Status = createdBooking.Status,
                Table = new TableInfoDto
                {
                    Id = createdBooking.Table.Id,
                    Location = createdBooking.Table.Location,
                    Seats = createdBooking.Table.Seats
                },
                CreatedAt = createdBooking.CreatedAt
            };

            _logger.LogInformation("CreateBooking: Возвращаем успешный ответ для бронирования ID={BookingId}", response.Id);
            return CreatedAtAction(nameof(GetBooking), new { id = response.Id }, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "CreateBooking: Исключение при создании бронирования. TableId={TableId}, ClientName={ClientName}, Error={ErrorMessage}",
                dto?.TableId, dto?.ClientName, ex.Message);
            return StatusCode(500, new
            {
                error = "Внутренняя ошибка сервера",
                message = "An error occurred while creating booking"
            });
        }
    }

    /// <summary>
    /// Обновить существующее бронирование
    /// </summary>
    /// <param name="id">ID бронирования</param>
    /// <param name="dto">Данные для обновления</param>
    /// <returns>Обновленное бронирование</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(BookingResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateBooking(int id, [FromBody] UpdateBookingDto dto)
    {
        try
        {
            var booking = await _context.Bookings
                .Include(b => b.Table)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return NotFound(new { error = "Бронирование не найдено", bookingId = id });
            }

            // Обновляем только предоставленные поля
            if (dto.ClientName != null)
                booking.ClientName = dto.ClientName.Trim();

            if (dto.ClientPhone != null)
            {
                if (!PhoneNormalizer.IsValid(dto.ClientPhone))
                {
                    return BadRequest(new { error = "Неверный формат номера телефона" });
                }
                booking.ClientPhone = PhoneNormalizer.NormalizeWithCountryCode(dto.ClientPhone);
            }

            if (dto.StartTime.HasValue)
                booking.StartTime = dto.StartTime.Value;

            if (dto.EndTime.HasValue)
                booking.EndTime = dto.EndTime.Value;

            if (dto.Comment != null)
                booking.Comment = dto.Comment.Trim();

            if (dto.Status != null)
                booking.Status = dto.Status;

            booking.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Обновлено бронирование #{BookingId}", id);

            var response = new BookingResponseDto
            {
                Id = booking.Id,
                ClientName = booking.ClientName,
                ClientPhone = booking.ClientPhone,
                PhoneLastFour = PhoneNormalizer.GetLastDigits(booking.ClientPhone, 4),
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                Comment = booking.Comment,
                Status = booking.Status,
                Table = new TableInfoDto
                {
                    Id = booking.Table!.Id,
                    Location = booking.Table.Location,
                    Seats = booking.Table.Seats
                },
                CreatedAt = booking.CreatedAt
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при обновлении бронирования #{Id}", id);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    /// <summary>
    /// Отменить бронирование
    /// </summary>
    /// <param name="id">ID бронирования</param>
    /// <returns>Результат операции</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelBooking(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);

        if (booking == null)
        {
            return NotFound(new { error = "Бронирование не найдено", bookingId = id });
        }

        // Мягкое удаление - меняем статус
        booking.Status = "отменено";
        booking.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Отменено бронирование #{BookingId}", id);

        return NoContent();
    }

    /// <summary>
    /// Маппинг русских статусов в английские для фронтенда
    /// </summary>
    private static string MapStatusToEnglish(string russianStatus)
    {
        return russianStatus?.ToLower() switch
        {
            "активно" => "Active",
            "завершено" => "Completed",
            "отменено" => "Cancelled",
            _ => "Active" // по умолчанию
        };
    }

    /// <summary>
    /// Маппинг английских статусов в русские для поиска в БД
    /// </summary>
    private static string MapStatusToRussian(string? englishStatus)
    {
        if (string.IsNullOrWhiteSpace(englishStatus))
            return "активно";

        return englishStatus.ToLower() switch
        {
            "active" => "активно",
            "completed" => "завершено",
            "cancelled" => "отменено",
            _ => englishStatus // если не распознан, оставляем как есть
        };
    }
}
