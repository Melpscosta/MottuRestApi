using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mottu.Data;
using Mottu.Models;

namespace Mottu.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retorna métricas gerais do pátio para o dashboard
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            var motos = await _context.Motos.ToListAsync();
            var alertasNaoLidos = await _context.Alertas.CountAsync(a => !a.Lido);
            var ultimosEventos = await _context.EventosIoT
                .Include(e => e.Moto)
                .OrderByDescending(e => e.Timestamp)
                .Take(5)
                .ToListAsync();

            return Ok(new
            {
                totalMotos = motos.Count,
                porStatus = new
                {
                    ativas = motos.Count(m => m.Status == StatusMoto.Ativa),
                    emUso = motos.Count(m => m.Status == StatusMoto.EmUso),
                    manutencao = motos.Count(m => m.Status == StatusMoto.Manutencao),
                    baixadas = motos.Count(m => m.Status == StatusMoto.Baixada)
                },
                porZona = new
                {
                    zonaA = motos.Count(m => m.Zona == "A"),
                    zonaB = motos.Count(m => m.Zona == "B"),
                    zonaC = motos.Count(m => m.Zona == "C")
                },
                alertasNaoLidos,
                ultimosEventos = ultimosEventos.Select(e => new
                {
                    e.Id,
                    e.Descricao,
                    e.Timestamp,
                    e.ZonaOrigem,
                    e.ZonaDestino,
                    motoPlaca = e.Moto?.Placa
                })
            });
        }

        /// <summary>
        /// Retorna motos agrupadas por zona
        /// </summary>
        [HttpGet("zonas")]
        public async Task<IActionResult> GetZonas()
        {
            var motos = await _context.Motos.ToListAsync();

            return Ok(new
            {
                zonas = new[]
                {
                    new { nome = "A", descricao = "Zona Principal", motos = motos.Where(m => m.Zona == "A") },
                    new { nome = "B", descricao = "Zona Secundária", motos = motos.Where(m => m.Zona == "B") },
                    new { nome = "C", descricao = "Zona Restrita", motos = motos.Where(m => m.Zona == "C") }
                }
            });
        }
    }
}
