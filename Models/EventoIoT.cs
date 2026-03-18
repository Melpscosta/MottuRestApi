namespace Mottu.Models
{
    public enum TipoEvento
    {
        EntradaZona,
        SaidaZona,
        MudancaStatus,
        AlertaMovimento
    }

    public class EventoIoT
    {
        public int Id { get; set; }
        public int MotoId { get; set; }
        public Moto? Moto { get; set; }
        public string ZonaOrigem { get; set; } = string.Empty;
        public string ZonaDestino { get; set; } = string.Empty;
        public TipoEvento Tipo { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
