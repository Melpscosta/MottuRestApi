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
            _logger.LogInformation("IoT Simulator iniciado — simulando beacons BLE a cada 60s");

            // Aguarda 15s para o app inicializar antes de começar
            await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);

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

                await Task.Delay(TimeSpan.FromSeconds(60), stoppingToken);
            }
        }

        public async Task SimularEventoAsync()
        {
            using var scope = _services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var motos = db.Motos.Where(m => m.Status != StatusMoto.Baixada).ToList();
            if (!motos.Any()) return;

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

            // Cria alerta se a zona destino for zona C (restrita no demo)
            if (zonaDestino == "C")
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

            await db.SaveChangesAsync();
            _logger.LogInformation("Beacon simulado: {Placa} Zona {Origem} → {Destino}", moto.Placa, zonaOrigem, zonaDestino);
        }
    }
}
