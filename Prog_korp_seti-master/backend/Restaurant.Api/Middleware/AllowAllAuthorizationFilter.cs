using Hangfire.Dashboard;

namespace Restaurant.Api.Middleware;

/// <summary>
/// Allow all authorization filter for Hangfire Dashboard (Development only)
/// </summary>
public class AllowAllAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        // Allow all requests in development
        return true;
    }
}
