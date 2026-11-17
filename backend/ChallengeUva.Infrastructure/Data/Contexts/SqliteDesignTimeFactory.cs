using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ChallengeUva.Infrastructure.Data.Contexts;

public class SqliteDesignTimeFactory : IDesignTimeDbContextFactory<ChallengeUvaContext>
{
    public ChallengeUvaContext CreateDbContext(string[] args)
    {
        var connection = Environment.GetEnvironmentVariable("ConnectionStrings__Default") ?? "Data Source=challenge.db";
        return new ChallengeUvaContext(new DbContextOptionsBuilder<ChallengeUvaContext>().UseSqlite(connection).Options);
    }
}
