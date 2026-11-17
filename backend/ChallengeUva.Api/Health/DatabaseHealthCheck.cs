using ChallengeUva.Infrastructure.Data.Contexts;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace ChallengeUva.Api.Health;

public class DatabaseHealthCheck : IHealthCheck
{
    private readonly IServiceScopeFactory scopes;
    public DatabaseHealthCheck(IServiceScopeFactory scopes) => this.scopes = scopes;

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        await using var scope = scopes.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ChallengeUvaContext>();
        return await db.Database.CanConnectAsync(cancellationToken)
            ? HealthCheckResult.Healthy()
            : HealthCheckResult.Unhealthy("Banco indisponível.");
    }
}
