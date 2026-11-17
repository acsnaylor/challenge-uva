using ChallengeUva.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ChallengeUva.Infrastructure.Data.Contexts;

public class PostgresDesignTimeFactory : IDesignTimeDbContextFactory<PostgresChallengeUvaContext>
{
    public PostgresChallengeUvaContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<PostgresChallengeUvaContext>();
        var connection = Environment.GetEnvironmentVariable("ConnectionStrings__Postgres")
            ?? Environment.GetEnvironmentVariable("DATABASE_URL");
        // Scaffolding and SQL generation need no server or invented credentials.
        if (string.IsNullOrWhiteSpace(connection)) options.UseNpgsql();
        else options.UseNpgsql(PostgresConnection.Parse(connection));
        return new PostgresChallengeUvaContext(options.Options);
    }
}
