using Microsoft.EntityFrameworkCore;
using ChallengeUva.Domain.Entities;

namespace ChallengeUva.Infrastructure.Data.Contexts
{
    public class ChallengeUvaContext : DbContext
    {
        public ChallengeUvaContext(DbContextOptions<ChallengeUvaContext> options) : base(options)
        {
        }

        public DbSet<Hero> Heroes { get; set; } = null!;
        public DbSet<Superpower> Superpowers { get; set; } = null!;
        public DbSet<HeroSuperpower> HeroSuperpowers { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Hero>().ToTable("Herois");
            modelBuilder.Entity<Superpower>().ToTable("Superpoderes");
            modelBuilder.Entity<HeroSuperpower>().ToTable("HeroisSuperpoderes");
            modelBuilder.Entity<Hero>()
                .HasIndex(h => h.HeroName)
                .IsUnique();
            modelBuilder.Entity<Superpower>()
                .HasIndex(s => s.Name)
                .IsUnique();
            modelBuilder.Entity<HeroSuperpower>()
                .HasKey(hs => new { hs.HeroId, hs.SuperpowerId });

            modelBuilder.Entity<HeroSuperpower>()
                .HasOne(hs => hs.Hero)
                .WithMany(h => h.HeroSuperpowers)
                .HasForeignKey(hs => hs.HeroId);

            modelBuilder.Entity<HeroSuperpower>()
                .HasOne(hs => hs.Superpower)
                .WithMany(s => s.HeroSuperpowers)
                .HasForeignKey(hs => hs.SuperpowerId);
        }
    }
}

