using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mottu.Data;

namespace Mottu.Controllers
{
    [ApiController]
    [Route("api/historico")]
    [Authorize]
    public class HistoricoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HistoricoController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetHistorico([FromQuery] int? motoId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var query = _context.EventosIoT.Include(e => e.Moto).AsQueryable();

            if (motoId.HasValue)
                query = query.Where(e => e.MotoId == motoId.Value);

            var total = await query.CountAsync();
            var eventos = await query
                .OrderByDescending(e => e.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(e => new
                {
                    e.Id,
                    e.Descricao,
                    e.ZonaOrigem,
                    e.ZonaDestino,
                    tipo = e.Tipo.ToString(),
                    e.Timestamp,
                    moto = e.Moto == null ? null : new { e.Moto.Id, e.Moto.Placa, e.Moto.Modelo, e.Moto.Marca }
                })
                .ToListAsync();

            return Ok(new { total, page, pageSize, eventos });
        }
    }
}
