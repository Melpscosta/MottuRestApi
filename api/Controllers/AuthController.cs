using Microsoft.AspNetCore.Mvc;
using Mottu.Auth;

namespace Mottu.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly JwtService _jwtService;

        public AuthController(JwtService jwtService)
        {
            _jwtService = jwtService;
        }

        /// <summary>
        /// Login demo. Credenciais: admin/admin123 ou operador/op123
        /// </summary>
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest req)
        {
            var token = _jwtService.Authenticate(req.Username, req.Password);
            if (token == null)
                return Unauthorized(new { message = "Usuário ou senha inválidos." });

            return Ok(new
            {
                token,
                username = req.Username,
                role = req.Username.ToLower() == "admin" ? "Admin" : "Operador",
                expiresIn = 28800 // 8 horas em segundos
            });
        }
    }

    public record LoginRequest(string Username, string Password);
}
