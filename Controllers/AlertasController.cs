using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mottu.Data;

namespace Mottu.Controllers
{
    [ApiController]
    [Route("api/alertas")]
    [Authorize]
    public class AlertasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AlertasController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAlertas([FromQuery] bool? apenasNaoLidos = false)
        {
            var query = _context.Alertas.Include(a => a.Moto).AsQueryable();

            if (apenasNaoLidos == true)
                query = query.Where(a => !a.Lido);

            var alertas = await query
                .OrderByDescending(a => a.Timestamp)
                .Take(50)
                .Select(a => new
                {
                    a.Id,
                    a.Titulo,
                    a.Descricao,
                    gravidade = a.Gravidade.ToString(),
                    a.Timestamp,
                    a.Lido,
                    motoPlaca = a.Moto != null ? a.Moto.Placa : null
                })
                .ToListAsync();

            return Ok(alertas);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetCount()
        {
            var count = await _context.Alertas.CountAsync(a => !a.Lido);
            return Ok(new { naoLidos = count });
        }

        [HttpPut("{id}/lido")]
        public async Task<IActionResult> MarcarLido(int id)
        {
            var alerta = await _context.Alertas.FindAsync(id);
            if (alerta == null) return NotFound();

            alerta.Lido = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Alerta marcado como lido." });
        }

        [HttpPut("marcar-todos-lidos")]
        public async Task<IActionResult> MarcarTodosLidos()
        {
            var alertas = await _context.Alertas.Where(a => !a.Lido).ToListAsync();
            alertas.ForEach(a => a.Lido = true);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{alertas.Count} alertas marcados como lidos." });
        }
    }
}
