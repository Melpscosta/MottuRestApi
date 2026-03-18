using Microsoft.EntityFrameworkCore;
using Mottu.Models;

namespace Mottu.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Moto> Motos { get; set; }
        public DbSet<EventoIoT> EventosIoT { get; set; }
        public DbSet<Alerta> Alertas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Seed de motos demo
            modelBuilder.Entity<Moto>().HasData(
                new Moto { Id = 1, Marca = "Honda", Modelo = "CG 160", Ano = 2022, Placa = "ABC-1234", Status = StatusMoto.Ativa, Zona = "A", UltimaAtualizacao = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Moto { Id = 2, Marca = "Yamaha", Modelo = "Factor 150", Ano = 2021, Placa = "DEF-5678", Status = StatusMoto.EmUso, Zona = "B", UltimaAtualizacao = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Moto { Id = 3, Marca = "Honda", Modelo = "Pop 110i", Ano = 2023, Placa = "GHI-9012", Status = StatusMoto.Manutencao, Zona = "C", UltimaAtualizacao = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Moto { Id = 4, Marca = "Yamaha", Modelo = "Fazer 250", Ano = 2020, Placa = "JKL-3456", Status = StatusMoto.Ativa, Zona = "A", UltimaAtualizacao = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Moto { Id = 5, Marca = "Honda", Modelo = "Biz 125", Ano = 2022, Placa = "MNO-7890", Status = StatusMoto.Baixada, Zona = "B", UltimaAtualizacao = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
            );
        }
    }
}