using FluentValidation;
using Restaurant.Api.Models;

namespace Restaurant.Api.Validators;

public class CreateBookingDtoValidator : AbstractValidator<CreateBookingDto>
{
    public CreateBookingDtoValidator()
    {
        RuleFor(x => x.TableId)
            .GreaterThan(0)
            .WithMessage("ID стола должен быть больше 0");

        RuleFor(x => x.ClientName)
            .NotEmpty()
            .WithMessage("Имя клиента обязательно")
            .MaximumLength(100)
            .WithMessage("Имя клиента не может превышать 100 символов");

        RuleFor(x => x.ClientPhone)
            .NotEmpty()
            .WithMessage("Телефон клиента обязателен")
            .Matches(@"^\+?[1-9]\d{1,14}$")
            .WithMessage("Некорректный формат телефона");

        RuleFor(x => x.StartTime)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("Время начала бронирования должно быть в будущем");

        RuleFor(x => x.EndTime)
            .GreaterThan(x => x.StartTime)
            .WithMessage("Время окончания должно быть позже времени начала");
    }
}

public class UpdateBookingDtoValidator : AbstractValidator<UpdateBookingDto>
{
    public UpdateBookingDtoValidator()
    {
        RuleFor(x => x.StartTime)
            .GreaterThan(DateTime.UtcNow)
            .When(x => x.StartTime.HasValue)
            .WithMessage("Время начала бронирования должно быть в будущем");

        RuleFor(x => x.EndTime)
            .GreaterThan(x => x.StartTime!.Value)
            .When(x => x.StartTime.HasValue && x.EndTime.HasValue)
            .WithMessage("Время окончания должно быть позже времени начала");

        RuleFor(x => x.Status)
            .Must(status => string.IsNullOrEmpty(status) || new[] { "активно", "завершено", "отменено" }.Contains(status))
            .WithMessage("Недопустимый статус бронирования");
    }
}
