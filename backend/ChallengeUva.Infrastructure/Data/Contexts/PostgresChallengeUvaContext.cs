using Microsoft.EntityFrameworkCore;

namespace ChallengeUva.Infrastructure.Data.Contexts;

// Same domain and mappings; a separate context isolates PostgreSQL migrations
// from the existing SQLite history and its provider-specific column types.
public class PostgresChallengeUvaContext : ChallengeUvaContext
{
    public PostgresChallengeUvaContext(DbContextOptions<PostgresChallengeUvaContext> options) : base(options) { }
}
