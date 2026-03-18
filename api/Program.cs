using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Mottu.Auth;
using Mottu.Data;
using Mottu.Models;
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

// ─── Cria o banco SQLite automaticamente (opcional: reset no dev) ─────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var resetDb = builder.Environment.IsDevelopment()
        && builder.Configuration.GetValue<bool>("Dev:ResetDatabaseOnStart");

    if (resetDb)
        db.Database.EnsureDeleted();

    db.Database.EnsureCreated();

    // Seed de eventos e alertas para a demo (se ainda estiver vazio)
    if (!await db.EventosIoT.AnyAsync())
    {
        var agora = DateTime.UtcNow;
        db.EventosIoT.AddRange(
            new EventoIoT { MotoId = 1, ZonaOrigem = "A", ZonaDestino = "B", Tipo = TipoEvento.EntradaZona, Descricao = "[Beacon BLE] Moto ABC-1234 detectada saindo de Zona A → Zona B", Timestamp = agora.AddMinutes(-15) },
            new EventoIoT { MotoId = 2, ZonaOrigem = "B", ZonaDestino = "A", Tipo = TipoEvento.EntradaZona, Descricao = "[Beacon BLE] Moto DEF-5678 detectada saindo de Zona B → Zona A", Timestamp = agora.AddMinutes(-10) },
            new EventoIoT { MotoId = 3, ZonaOrigem = "C", ZonaDestino = "B", Tipo = TipoEvento.EntradaZona, Descricao = "[Beacon BLE] Moto GHI-9012 detectada saindo de Zona C → Zona B", Timestamp = agora.AddMinutes(-5) },
            new EventoIoT { MotoId = 4, ZonaOrigem = "A", ZonaDestino = "B", Tipo = TipoEvento.EntradaZona, Descricao = "[Beacon BLE] Moto JKL-3456 detectada saindo de Zona A → Zona B", Timestamp = agora.AddMinutes(-2) }
        );
    }

    if (!await db.Alertas.AnyAsync())
    {
        var agora = DateTime.UtcNow;
        db.Alertas.AddRange(
            new Alerta { Titulo = "Moto em Zona Restrita", Descricao = "Moto GHI-9012 (Pop 110i) entrou na Zona C (restrita) sem autorização.", Gravidade = GravidadeAlerta.Critico, MotoId = 3, Timestamp = agora.AddMinutes(-8), Lido = false },
            new Alerta { Titulo = "Moto em Zona Restrita", Descricao = "Moto ABC-1234 (CG 160) entrou na Zona C (restrita) sem autorização.", Gravidade = GravidadeAlerta.Critico, MotoId = 1, Timestamp = agora.AddMinutes(-3), Lido = false }
        );
    }

    await db.SaveChangesAsync();
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
