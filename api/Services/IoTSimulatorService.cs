using Microsoft.EntityFrameworkCore;
using Mottu.Data;
using Mottu.Models;

namespace Mottu.Services
{
    public class IoTSimulatorService : BackgroundService
    {
        private readonly IServiceProvider _services;
        private readonly ILogger<IoTSimulatorService> _logger;
        private readonly string[] _zonas = { "A", "B", "C" };
        private readonly Random _random = new();

        public IoTSimulatorService(IServiceProvider services, ILogger<IoTSimulatorService> logger)
        {
            _services = services;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("IoT Simulator iniciado — simulando beacons BLE a cada 2 min");

            // Aguarda 20s para o app inicializar antes de começar
            await Task.Delay(TimeSpan.FromSeconds(20), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await SimularEventoAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erro ao simular evento IoT");
                }

                // A cada 2 min — gera eventos com frequência razoável para a demo
                await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);
            }
        }

        public async Task SimularEventoAsync()
        {
            using var scope = _services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var motos = db.Motos.Where(m => m.Status != StatusMoto.Baixada).ToList();
            if (!motos.Any()) return;

            // Move em 85% dos ciclos — simulação visível com vários eventos/alertas
            if (_random.Next(100) >= 85) return;

            var moto = motos[_random.Next(motos.Count)];
            var zonaOrigem = moto.Zona;
            var zonaDestino = _zonas.Where(z => z != zonaOrigem).ElementAt(_random.Next(2));

            // Atualiza a moto
            var zonaAnterior = moto.Zona;
            moto.Zona = zonaDestino;
            moto.UltimaAtualizacao = DateTime.UtcNow;

            // Registra o evento
            var evento = new EventoIoT
            {
                MotoId = moto.Id,
                ZonaOrigem = zonaOrigem,
                ZonaDestino = zonaDestino,
                Tipo = TipoEvento.EntradaZona,
                Descricao = $"[Beacon BLE] Moto {moto.Placa} detectada saindo de Zona {zonaOrigem} → Zona {zonaDestino}",
                Timestamp = DateTime.UtcNow
            };

            db.EventosIoT.Add(evento);

            // Alerta quando entra na Zona C — no máximo 1 por moto a cada 10 min (demo com alertas visíveis)
            if (zonaDestino == "C")
            {
                var ultimoAlertaDaMoto = await db.Alertas
                    .Where(a => a.MotoId == moto.Id)
                    .OrderByDescending(a => a.Timestamp)
                    .FirstOrDefaultAsync();
                var haDezMin = DateTime.UtcNow.AddMinutes(-10);
                if (ultimoAlertaDaMoto == null || ultimoAlertaDaMoto.Timestamp < haDezMin)
                {
                    db.Alertas.Add(new Alerta
                    {
                        Titulo = "Moto em Zona Restrita",
                        Descricao = $"Moto {moto.Placa} ({moto.Modelo}) entrou na Zona C (restrita) sem autorização.",
                        Gravidade = GravidadeAlerta.Critico,
                        MotoId = moto.Id,
                        Timestamp = DateTime.UtcNow
                    });
                }
            }

            await db.SaveChangesAsync();
            _logger.LogInformation("Beacon simulado: {Placa} Zona {Origem} → {Destino}", moto.Placa, zonaOrigem, zonaDestino);
        }
    }
}
