using FluentValidation;
using Restaurant.Api.Controllers;

namespace Restaurant.Api.Validators;

public class CreateOrderDtoValidator : AbstractValidator<CreateOrderDto>
{
    public CreateOrderDtoValidator()
    {
        RuleFor(x => x.TableId)
            .GreaterThan(0)
            .WithMessage("ID стола должен быть больше 0");

        RuleFor(x => x.WaiterId)
            .GreaterThan(0)
            .WithMessage("ID официанта должен быть больше 0");

        RuleFor(x => x.Items)
            .NotEmpty()
            .WithMessage("Заказ должен содержать хотя бы одно блюдо");

        RuleForEach(x => x.Items)
            .SetValidator(new OrderItemDtoValidator());
    }
}

public class OrderItemDtoValidator : AbstractValidator<OrderItemDto>
{
    public OrderItemDtoValidator()
    {
        RuleFor(x => x.DishId)
            .GreaterThan(0)
            .WithMessage("ID блюда должен быть больше 0");

        RuleFor(x => x.Quantity)
            .GreaterThan(0)
            .WithMessage("Количество должно быть больше 0")
            .LessThanOrEqualTo(100)
            .WithMessage("Количество не может превышать 100");
    }
}

public class UpdateOrderStatusDtoValidator : AbstractValidator<UpdateOrderStatusDto>
{
    public UpdateOrderStatusDtoValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty()
            .WithMessage("Статус не может быть пустым")
            .Must(status => new[] { "pending", "preparing", "ready", "served", "completed", "cancelled" }.Contains(status))
            .WithMessage("Недопустимый статус заказа");
    }
}
