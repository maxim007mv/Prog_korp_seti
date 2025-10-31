using Microsoft.EntityFrameworkCore;

namespace Restaurant.Api.Models;

/// <summary>
/// Параметры пагинации для запросов
/// </summary>
public class PaginationParams
{
    private const int MaxPageSize = 100;
    private int _pageSize = 20;

    /// <summary>
    /// Номер страницы (начинается с 1)
    /// </summary>
    public int PageNumber { get; set; } = 1;

    /// <summary>
    /// Размер страницы (по умолчанию 20, максимум 100)
    /// </summary>
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
    }

    /// <summary>
    /// Поле для сортировки
    /// </summary>
    public string? SortBy { get; set; }

    /// <summary>
    /// Направление сортировки (asc/desc)
    /// </summary>
    public string SortOrder { get; set; } = "asc";

    public int Skip => (PageNumber - 1) * PageSize;
}

/// <summary>
/// Результат с пагинацией
/// </summary>
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPrevious => PageNumber > 1;
    public bool HasNext => PageNumber < TotalPages;

    public PagedResult() { }

    public PagedResult(List<T> items, int count, int pageNumber, int pageSize)
    {
        Items = items;
        TotalCount = count;
        PageNumber = pageNumber;
        PageSize = pageSize;
    }
}

/// <summary>
/// Extension методы для пагинации
/// </summary>
public static class PaginationExtensions
{
    public static async Task<PagedResult<T>> ToPagedResultAsync<T>(
        this IQueryable<T> query,
        int pageNumber,
        int pageSize)
    {
        var count = await query.CountAsync();
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<T>(items, count, pageNumber, pageSize);
    }

    public static PagedResult<TDestination> Map<TSource, TDestination>(
        this PagedResult<TSource> source,
        Func<TSource, TDestination> mapper)
    {
        return new PagedResult<TDestination>
        {
            Items = source.Items.Select(mapper).ToList(),
            TotalCount = source.TotalCount,
            PageNumber = source.PageNumber,
            PageSize = source.PageSize
        };
    }
}
