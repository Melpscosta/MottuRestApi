namespace Mottu.Models
{
    public enum GravidadeAlerta
    {
        Info,
        Aviso,
        Critico
    }

    public class Alerta
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public GravidadeAlerta Gravidade { get; set; } = GravidadeAlerta.Info;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public bool Lido { get; set; } = false;
        public int? MotoId { get; set; }
        public Moto? Moto { get; set; }
    }
}
