using Microsoft.EntityFrameworkCore;
using ChallengeUva.Domain.Entities;

namespace ChallengeUva.Infrastructure.Data.Contexts
{
    public class ChallengeUvaContext : DbContext
    {
        public ChallengeUvaContext(DbContextOptions<ChallengeUvaContext> options) : base(options)
        {
        }

        protected ChallengeUvaContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Hero> Heroes { get; set; } = null!;
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Customer> Customers => Set<Customer>();
        public DbSet<Cart> Carts => Set<Cart>();
        public DbSet<CartItem> CartItems => Set<CartItem>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
        public DbSet<Superpower> Superpowers { get; set; } = null!;
        public DbSet<HeroSuperpower> HeroSuperpowers { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<ContactMessage>().Property(m => m.Name).HasMaxLength(100);
            modelBuilder.Entity<ContactMessage>().Property(m => m.Email).HasMaxLength(254);
            modelBuilder.Entity<ContactMessage>().Property(m => m.Subject).HasMaxLength(150);
            modelBuilder.Entity<ContactMessage>().Property(m => m.Message).HasMaxLength(3000);
            modelBuilder.Entity<ContactMessage>().Property(m => m.CreatedAt)
                .HasConversion(value => value, value => DateTime.SpecifyKind(value, DateTimeKind.Utc));
            modelBuilder.Entity<Product>().Property(p => p.Price).HasConversion<long>(v => (long)(v * 100), v => v / 100m);
            modelBuilder.Entity<Customer>().HasIndex(c => c.Email).IsUnique();
            modelBuilder.Entity<Cart>().Property(c => c.Revision).IsConcurrencyToken();
            modelBuilder.Entity<Cart>().HasMany(c => c.Items).WithOne().HasForeignKey(i => i.CartId);
            modelBuilder.Entity<CartItem>().HasIndex(i => new { i.CartId, i.ProductId }).IsUnique();
            modelBuilder.Entity<Order>().HasIndex(o => o.CartId).IsUnique();
            modelBuilder.Entity<Order>().Property(o => o.CreatedAt).HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
            modelBuilder.Entity<Order>().HasOne<Cart>().WithMany().HasForeignKey(o => o.CartId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Order>().HasMany(o => o.Items).WithOne().HasForeignKey(i => i.OrderId);
            modelBuilder.Entity<Order>().Property(o => o.Total).HasConversion<long>(v => (long)(v * 100), v => v / 100m);
            modelBuilder.Entity<OrderItem>().Property(i => i.UnitPrice).HasConversion<long>(v => (long)(v * 100), v => v / 100m);
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

