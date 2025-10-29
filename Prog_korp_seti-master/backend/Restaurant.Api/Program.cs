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

var builder = WebApplication.CreateBuilder(args);

// Serilog
builder.Host.UseSerilog((context, services, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .WriteTo.Console();
});

// Services
builder.Services.AddControllers();

// SignalR
builder.Services.AddSignalR();

// CORS: разрешаем фронтенду обращаться к API (адаптировать origin по среде)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
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

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();

// Infrastructure (DbContext)
builder.Services.AddInfrastructure(builder.Configuration);

// Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Health Checks
builder.Services.AddHealthChecks();

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

app.UseSerilogRequestLogging();

// Exception handling middleware (должен быть первым)
app.UseExceptionHandlingMiddleware();

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

// Rate Limiter
app.UseRateLimiter();

// Health Checks
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready");

// SignalR Hubs
app.MapHub<OrderHub>("/hubs/orders");

app.MapControllers();

app.Run();
