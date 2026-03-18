using System.ComponentModel.DataAnnotations;

namespace Mottu.Models
{
    public enum StatusMoto
    {
        Ativa,
        EmUso,
        Manutencao,
        Baixada
    }

    public class Moto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Marca é obrigatória")]
        [MaxLength(50)]
        public string Marca { get; set; } = string.Empty;

        [Required(ErrorMessage = "Modelo é obrigatório")]
        [MaxLength(100)]
        public string Modelo { get; set; } = string.Empty;

        [Range(1900, 2100, ErrorMessage = "Ano inválido")]
        public int Ano { get; set; }

        [Required(ErrorMessage = "Placa é obrigatória")]
        [MaxLength(10)]
        public string Placa { get; set; } = string.Empty;

        public StatusMoto Status { get; set; } = StatusMoto.Ativa;

        [MaxLength(5)]
        public string Zona { get; set; } = "A";

        public DateTime UltimaAtualizacao { get; set; } = DateTime.UtcNow;
    }
}
