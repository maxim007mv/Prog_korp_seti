using System.Linq.Expressions;

namespace Restaurant.Domain.Common;

/// <summary>
/// Base specification for filtering entities
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public abstract class Specification<T>
{
    /// <summary>
    /// Filter criteria
    /// </summary>
    public Expression<Func<T, bool>>? Criteria { get; protected set; }

    /// <summary>
    /// Include expressions for eager loading
    /// </summary>
    public List<Expression<Func<T, object>>> Includes { get; } = new();

    /// <summary>
    /// Include string expressions for eager loading (ThenInclude)
    /// </summary>
    public List<string> IncludeStrings { get; } = new();

    /// <summary>
    /// Order by ascending
    /// </summary>
    public Expression<Func<T, object>>? OrderBy { get; protected set; }

    /// <summary>
    /// Order by descending
    /// </summary>
    public Expression<Func<T, object>>? OrderByDescending { get; protected set; }

    /// <summary>
    /// Pagination - skip
    /// </summary>
    public int? Skip { get; protected set; }

    /// <summary>
    /// Pagination - take
    /// </summary>
    public int? Take { get; protected set; }

    /// <summary>
    /// Enable tracking (default: false for read-only queries)
    /// </summary>
    public bool AsNoTracking { get; protected set; } = true;

    /// <summary>
    /// Add include for eager loading
    /// </summary>
    protected virtual void AddInclude(Expression<Func<T, object>> includeExpression)
    {
        Includes.Add(includeExpression);
    }

    /// <summary>
    /// Add include string for complex eager loading
    /// </summary>
    protected virtual void AddInclude(string includeString)
    {
        IncludeStrings.Add(includeString);
    }

    /// <summary>
    /// Apply pagination
    /// </summary>
    protected virtual void ApplyPaging(int skip, int take)
    {
        Skip = skip;
        Take = take;
    }

    /// <summary>
    /// Apply ordering ascending
    /// </summary>
    protected virtual void ApplyOrderBy(Expression<Func<T, object>> orderByExpression)
    {
        OrderBy = orderByExpression;
    }

    /// <summary>
    /// Apply ordering descending
    /// </summary>
    protected virtual void ApplyOrderByDescending(Expression<Func<T, object>> orderByDescending)
    {
        OrderByDescending = orderByDescending;
    }

    /// <summary>
    /// Enable change tracking
    /// </summary>
    protected virtual void EnableTracking()
    {
        AsNoTracking = false;
    }

    /// <summary>
    /// Combines specifications using AND logic
    /// </summary>
    public static Specification<T> operator &(Specification<T> left, Specification<T> right)
    {
        return new AndSpecification<T>(left, right);
    }

    /// <summary>
    /// Combines specifications using OR logic
    /// </summary>
    public static Specification<T> operator |(Specification<T> left, Specification<T> right)
    {
        return new OrSpecification<T>(left, right);
    }
}

/// <summary>
/// AND specification combinator
/// </summary>
internal class AndSpecification<T> : Specification<T>
{
    public AndSpecification(Specification<T> left, Specification<T> right)
    {
        if (left.Criteria != null && right.Criteria != null)
        {
            var parameter = Expression.Parameter(typeof(T));
            var leftVisitor = new ReplaceParameterVisitor(parameter);
            var leftExpr = leftVisitor.Visit(left.Criteria.Body);

            var rightVisitor = new ReplaceParameterVisitor(parameter);
            var rightExpr = rightVisitor.Visit(right.Criteria.Body);

            Criteria = Expression.Lambda<Func<T, bool>>(
                Expression.AndAlso(leftExpr!, rightExpr!), parameter);
        }
    }

    private class ReplaceParameterVisitor : ExpressionVisitor
    {
        private readonly ParameterExpression _parameter;

        public ReplaceParameterVisitor(ParameterExpression parameter)
        {
            _parameter = parameter;
        }

        protected override Expression VisitParameter(ParameterExpression node)
        {
            return _parameter;
        }
    }
}

/// <summary>
/// OR specification combinator
/// </summary>
internal class OrSpecification<T> : Specification<T>
{
    public OrSpecification(Specification<T> left, Specification<T> right)
    {
        if (left.Criteria != null && right.Criteria != null)
        {
            var parameter = Expression.Parameter(typeof(T));
            var leftVisitor = new ReplaceParameterVisitor(parameter);
            var leftExpr = leftVisitor.Visit(left.Criteria.Body);

            var rightVisitor = new ReplaceParameterVisitor(parameter);
            var rightExpr = rightVisitor.Visit(right.Criteria.Body);

            Criteria = Expression.Lambda<Func<T, bool>>(
                Expression.OrElse(leftExpr!, rightExpr!), parameter);
        }
    }

    private class ReplaceParameterVisitor : ExpressionVisitor
    {
        private readonly ParameterExpression _parameter;

        public ReplaceParameterVisitor(ParameterExpression parameter)
        {
            _parameter = parameter;
        }

        protected override Expression VisitParameter(ParameterExpression node)
        {
            return _parameter;
        }
    }
}
