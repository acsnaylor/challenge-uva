using ChallengeUva.Infrastructure.Data;
using ChallengeUva.Infrastructure.Data.Contexts;
using Microsoft.EntityFrameworkCore;

namespace ChallengeUva.Api.Extensions;

public static class DatabaseConfiguration
{
    public static IServiceCollection AddShopDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        var provider = configuration["Database:Provider"] ?? "SQLite";
        if (provider.Equals("PostgreSQL", StringComparison.OrdinalIgnoreCase))
        {
            if (configuration.GetValue<bool>("UseInMemoryDatabase"))
                throw new InvalidOperationException("PostgreSQL não pode ser combinado com UseInMemoryDatabase.");
            var connection = configuration.GetConnectionString("Postgres") ?? configuration["DATABASE_URL"];
            if (string.IsNullOrWhiteSpace(connection))
                throw new InvalidOperationException("Configure DATABASE_URL ou ConnectionStrings__Postgres para utilizar PostgreSQL.");
            var parsed = PostgresConnection.Parse(connection);
            services.AddDbContext<PostgresChallengeUvaContext>(options => options.UseNpgsql(parsed));
            services.AddScoped<ChallengeUvaContext>(provider => provider.GetRequiredService<PostgresChallengeUvaContext>());
        }
        else if (provider.Equals("SQLite", StringComparison.OrdinalIgnoreCase))
        {
            services.AddDbContext<ChallengeUvaContext>(options => {
                if (configuration.GetValue<bool>("UseInMemoryDatabase")) options.UseInMemoryDatabase("CupcakeShop");
                else options.UseSqlite(configuration.GetConnectionString("Default"));
            });
        }
        else throw new InvalidOperationException("Database__Provider deve ser SQLite ou PostgreSQL.");
        return services;
    }
}
