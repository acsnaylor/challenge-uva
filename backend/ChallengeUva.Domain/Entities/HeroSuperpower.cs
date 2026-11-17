using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeUva.Domain.Entities
{
    public class HeroSuperpower
    {
        [Column("HeroiId")]
        public int HeroId { get; set; }

        [Column("SuperpoderId")]
        public int SuperpowerId { get; set; }

        public Hero? Hero { get; set; }
        public Superpower? Superpower { get; set; }
    }
}

