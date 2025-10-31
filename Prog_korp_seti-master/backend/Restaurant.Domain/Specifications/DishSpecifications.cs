using Restaurant.Domain.Common;
using Restaurant.Domain.Entities;

namespace Restaurant.Domain.Specifications;

/// <summary>
/// Specification for available dishes
/// </summary>
public class AvailableDishesSpecification : Specification<Dish>
{
    public AvailableDishesSpecification()
    {
        Criteria = d => d.IsAvailable && !d.IsDeleted;
        AddInclude(d => d.Category!);
        ApplyOrderBy(d => d.Name);
    }
}

/// <summary>
/// Specification for dishes by category
/// </summary>
public class DishesByCategorySpecification : Specification<Dish>
{
    public DishesByCategorySpecification(int categoryId)
    {
        Criteria = d => d.CategoryId == categoryId && d.IsAvailable && !d.IsDeleted;
        AddInclude(d => d.Category!);
        ApplyOrderBy(d => d.Name);
    }
}

/// <summary>
/// Specification for dishes by price range
/// </summary>
public class DishesByPriceRangeSpecification : Specification<Dish>
{
    public DishesByPriceRangeSpecification(decimal minPrice, decimal maxPrice)
    {
        Criteria = d => d.Price >= minPrice && d.Price <= maxPrice && 
                       d.IsAvailable && !d.IsDeleted;
        AddInclude(d => d.Category!);
        ApplyOrderBy(d => d.Price);
    }
}
