using Microsoft.EntityFrameworkCore;
using Mottu.Models;

namespace Mottu.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Moto> Motos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Moto>().ToTable("MOTO");
            modelBuilder.Entity<Moto>(entity =>
            {
                entity.Property(e => e.Id).HasColumnName("ID");
                entity.Property(e => e.Marca).HasColumnName("MARCA");
                entity.Property(e => e.Modelo).HasColumnName("MODELO");
                entity.Property(e => e.Ano).HasColumnName("ANO");
                entity.Property(e => e.Placa).HasColumnName("PLACA");
            });
        }
    }
}