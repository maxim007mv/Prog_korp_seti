using System.Text;
using System.Threading.RateLimiting;
using AutoMapper;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Restaurant.Infrastructure;
using Restaurant.Application.Interfaces;
using Restaurant.Infrastructure.UnitOfWork;
using Restaurant.Api.Middleware;
using Restaurant.Api.Hubs;
using Hangfire;
using Hangfire.PostgreSql;
using Hangfire.Dashboard;
using Restaurant.Api.BackgroundJobs;
using Asp.Versioning;

var builder = WebApplication.CreateBuilder(args);

// Serilog with Enrichers
builder.Host.UseSerilog((context, services, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithEnvironmentName()
        .Enrich.WithThreadId()
        .Enrich.WithProperty("Application", "RestaurantAPI")
        .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}");
});

// Services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Fix circular reference errors in EF Core navigation properties
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// Response Compression (Gzip + Brotli)
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProvider>();
    options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProvider>();
});

builder.Services.Configure<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProviderOptions>(options =>
{
    options.Level = System.IO.Compression.CompressionLevel.Fastest;
});

builder.Services.Configure<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProviderOptions>(options =>
{
    options.Level = System.IO.Compression.CompressionLevel.SmallestSize;
});

// API Versioning
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),
        new HeaderApiVersionReader("X-Api-Version")
    );
}).AddMvc();

// SignalR
builder.Services.AddSignalR();

// CORS: разрешаем фронтенду обращаться к API (адаптировать origin по среде)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .WithExposedHeaders("X-Correlation-ID", "Content-Type", "Authorization");
    });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Restaurant API", Version = "v1" });
    // JWT support in Swagger
    c.AddSecurityDefinition("Bearer", new()
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Введите JWT с префиксом Bearer"
    });
    c.AddSecurityRequirement(new()
    {
        {
            new() { Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" } },
            new List<string>()
        }
    });
});

// ProblemDetails (builtin)
builder.Services.AddProblemDetails();

// AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Restaurant.Application.AssemblyReference).Assembly));

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();

// Infrastructure (DbContext)
builder.Services.AddInfrastructure(builder.Configuration);

// Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Repositories
builder.Services.AddScoped<Restaurant.Application.Interfaces.IBookingRepository, Restaurant.Infrastructure.Repositories.BookingRepository>();
builder.Services.AddScoped<Restaurant.Application.Interfaces.IDishRepository, Restaurant.Infrastructure.Repositories.DishRepository>();
builder.Services.AddScoped<Restaurant.Application.Interfaces.IOrderRepository, Restaurant.Infrastructure.Repositories.OrderRepository>();
builder.Services.AddScoped<Restaurant.Application.Interfaces.ITableRepository, Restaurant.Infrastructure.Repositories.TableRepository>();
builder.Services.AddScoped<Restaurant.Application.Interfaces.IUserRepository, Restaurant.Infrastructure.Repositories.UserRepository>();

// Health Checks
builder.Services.AddHealthChecks();

// Memory Cache для производительности
builder.Services.AddMemoryCache();
builder.Services.AddDistributedMemoryCache();

// Cache Service
builder.Services.AddScoped<Restaurant.Api.Services.ICacheService, Restaurant.Api.Services.CacheService>();

// Hangfire Background Jobs
builder.Services.AddHangfire(config =>
{
    config.UsePostgreSqlStorage(options =>
    {
        options.UseNpgsqlConnection(builder.Configuration.GetConnectionString("DefaultConnection"));
    });
});
builder.Services.AddHangfireServer();

// Background Jobs
builder.Services.AddScoped<CleanupExpiredBookingsJob>();
builder.Services.AddScoped<DailyReportsJob>();
builder.Services.AddScoped<CacheWarmupJob>();

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.Identity?.Name ?? context.Request.Headers.Host.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));
    
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            error = "Слишком много запросов. Пожалуйста, попробуйте позже.",
            statusCode = 429
        }, cancellationToken: token);
    };
});

// Authentication & Authorization
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "dev_secret_change_me";
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("admin", p => p.RequireRole("администратор"));
    options.AddPolicy("waiter", p => p.RequireRole("официант"));
    options.AddPolicy("client", p => p.RequireRole("клиент"));
});

var app = builder.Build();

// Correlation ID (должен быть первым для трекинга всех запросов)
app.UseCorrelationId();

// CORS должен быть очень рано в pipeline, до UseRouting
app.UseCors("AllowFrontend");

// Response Compression
app.UseResponseCompression();

app.UseSerilogRequestLogging(options =>
{
    options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        diagnosticContext.Set("ClientIP", httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown");
        diagnosticContext.Set("UserAgent", httpContext.Request.Headers["User-Agent"].ToString());
        diagnosticContext.Set("Protocol", httpContext.Request.Protocol);
    };
});

// Глобальная обработка исключений
app.UseGlobalExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    
    // Hangfire Dashboard (только в Development)
    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {
        Authorization = new[] { new AllowAllAuthorizationFilter() } // No auth in dev
    });
}

app.UseAuthentication();
app.UseAuthorization();

// Schedule recurring jobs
RecurringJob.AddOrUpdate<CleanupExpiredBookingsJob>(
    "cleanup-expired-bookings",
    job => job.ExecuteAsync(),
    Cron.Hourly); // Every hour

RecurringJob.AddOrUpdate<DailyReportsJob>(
    "daily-reports",
    job => job.ExecuteAsync(),
    Cron.Daily(2)); // Every day at 2 AM

RecurringJob.AddOrUpdate<CacheWarmupJob>(
    "cache-warmup",
    job => job.ExecuteAsync(),
    "*/15 * * * *"); // Every 15 minutes

// Rate Limiter
app.UseRateLimiter();

// Health Checks
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready");

// SignalR Hubs
app.MapHub<OrderHub>("/hubs/orders");

app.MapControllers();

app.Run();
