using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Mottu.Auth
{
    public class JwtService
    {
        private readonly string _secret;
        private readonly string _issuer;

        // Usuários demo hardcoded para portfólio
        private static readonly Dictionary<string, (string Password, string Role)> _users = new()
        {
            { "admin",    ("admin123", "Admin") },
            { "operador", ("op123",    "Operador") }
        };

        public JwtService(IConfiguration config)
        {
            _secret = config["Jwt:Secret"] ?? "mottu-patio-digital-secret-key-2026!";
            _issuer = config["Jwt:Issuer"] ?? "MottuApi";
        }

        public string? Authenticate(string username, string password)
        {
            if (!_users.TryGetValue(username.ToLower(), out var user))
                return null;
            if (user.Password != password)
                return null;

            return GenerateToken(username, user.Role);
        }

        private string GenerateToken(string username, string role)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _issuer,
                audience: _issuer,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
