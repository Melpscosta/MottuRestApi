using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Mottu.Auth;
using Mottu.Data;
using Mottu.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ─── Banco de dados SQLite ────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("SqliteDb") ?? "Data Source=mottu.db"));

// ─── Autenticação JWT ─────────────────────────────────────────────────
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "mottu-patio-digital-secret-key-2026!";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "MottuApi",
            ValidAudience = "MottuApi",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddSingleton<JwtService>();

// ─── IoT Simulator ────────────────────────────────────────────────────
builder.Services.AddSingleton<IoTSimulatorService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<IoTSimulatorService>());

// ─── CORS (permite qualquer origem para dev local / Expo) ─────────────
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

// ─── Controllers + Swagger com JWT ───────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Mottu Pátio Digital API",
        Version = "v1",
        Description = "API demo para portfólio — Pátio Digital com IoT simulado"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization. Ex: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ─── Cria e migra o banco SQLite automaticamente ──────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureDeleted(); // reset para garantir seed limpo em dev
    db.Database.EnsureCreated();
}

// ─── Swagger sempre ativo (portfólio) ─────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mottu Pátio Digital API v1");
    c.RoutePrefix = string.Empty; // abre na raiz: http://localhost:5000
});

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
