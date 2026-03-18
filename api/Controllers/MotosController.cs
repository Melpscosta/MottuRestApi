using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mottu.Data;
using Mottu.Models;
using Mottu.Services;

namespace Mottu.Controllers
{
    [ApiController]
    [Route("api/motos")]
    public class MotosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IoTSimulatorService _iotSimulator;

        public MotosController(AppDbContext context, IoTSimulatorService iotSimulator)
        {
            _context = context;
            _iotSimulator = iotSimulator;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Moto>>> GetAll()
        {
            return Ok(await _context.Motos.ToListAsync());
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Moto>> GetById(int id)
        {
            var moto = await _context.Motos.FindAsync(id);
            if (moto == null) return NotFound();
            return Ok(moto);
        }

        [HttpGet("busca")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Moto>>> GetByMarca([FromQuery] string? marca)
        {
            if (string.IsNullOrWhiteSpace(marca))
                return BadRequest(new { message = "Parâmetro 'marca' é obrigatório." });

            var motos = await _context.Motos
                .Where(m => m.Marca.ToLower().Contains(marca.ToLower()))
                .ToListAsync();

            if (!motos.Any()) return NotFound(new { message = "Nenhuma moto encontrada." });
            return Ok(motos);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Moto>> Create([FromBody] Moto moto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            moto.UltimaAtualizacao = DateTime.UtcNow;
            _context.Motos.Add(moto);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = moto.Id }, moto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] Moto moto)
        {
            if (id != moto.Id) return BadRequest(new { message = "ID não confere." });
            if (!ModelState.IsValid) return BadRequest(ModelState);

            moto.UltimaAtualizacao = DateTime.UtcNow;
            _context.Entry(moto).State = EntityState.Modified;

            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Motos.Any(m => m.Id == id)) return NotFound();
                throw;
            }

            return Ok(moto);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var moto = await _context.Motos.FindAsync(id);
            if (moto == null) return NotFound();

            _context.Motos.Remove(moto);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// Simula um evento IoT manualmente (acionado pelo app mobile)
        /// </summary>
        [HttpPost("simular-iot")]
        [Authorize]
        public async Task<IActionResult> SimularIoT()
        {
            await _iotSimulator.SimularEventoAsync();
            return Ok(new { message = "Evento IoT simulado com sucesso! Verifique o histórico." });
        }
    }
}
