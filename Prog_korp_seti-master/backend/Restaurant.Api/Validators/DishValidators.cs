using FluentValidation;

namespace Restaurant.Api.Validators;

public class CreateDishDtoValidator : AbstractValidator<CreateDishDto>
{
    public CreateDishDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Название блюда обязательно")
            .MaximumLength(200)
            .WithMessage("Название блюда не может превышать 200 символов");

        RuleFor(x => x.Price)
            .GreaterThan(0)
            .WithMessage("Цена должна быть больше 0")
            .LessThanOrEqualTo(100000)
            .WithMessage("Цена не может превышать 100000");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0)
            .WithMessage("ID категории должен быть больше 0");

        RuleFor(x => x.Weight)
            .MaximumLength(50)
            .WithMessage("Вес не может превышать 50 символов");

        RuleFor(x => x.CookingTime)
            .GreaterThanOrEqualTo(0)
            .When(x => x.CookingTime.HasValue)
            .WithMessage("Время приготовления не может быть отрицательным");
    }
}

public class UpdateDishDtoValidator : AbstractValidator<UpdateDishDto>
{
    public UpdateDishDtoValidator()
    {
        RuleFor(x => x.Name)
            .MaximumLength(200)
            .When(x => !string.IsNullOrEmpty(x.Name))
            .WithMessage("Название блюда не может превышать 200 символов");

        RuleFor(x => x.Price)
            .GreaterThan(0)
            .When(x => x.Price.HasValue)
            .WithMessage("Цена должна быть больше 0")
            .LessThanOrEqualTo(100000)
            .When(x => x.Price.HasValue)
            .WithMessage("Цена не может превышать 100000");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0)
            .When(x => x.CategoryId.HasValue)
            .WithMessage("ID категории должен быть больше 0");
    }
}

// DTOs
public class CreateDishDto
{
    public string Name { get; set; } = "";
    public string? Composition { get; set; }
    public string? Weight { get; set; }
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public int? CookingTime { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsAvailable { get; set; } = true;
}

public class UpdateDishDto
{
    public string? Name { get; set; }
    public string? Composition { get; set; }
    public string? Weight { get; set; }
    public decimal? Price { get; set; }
    public int? CategoryId { get; set; }
    public int? CookingTime { get; set; }
    public string? ImageUrl { get; set; }
    public bool? IsAvailable { get; set; }
}
