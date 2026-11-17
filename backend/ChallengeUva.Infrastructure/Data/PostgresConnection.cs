using Npgsql;

namespace ChallengeUva.Infrastructure.Data;

public static class PostgresConnection
{
    public static string Parse(string value)
    {
        try
        {
            if (!value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
                !value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
                return new NpgsqlConnectionStringBuilder(value).ConnectionString;

            var uri = new Uri(value);
            var credentials = uri.UserInfo.Split(':', 2);
            if (credentials.Length != 2 || string.IsNullOrWhiteSpace(uri.Host) || uri.AbsolutePath.Length <= 1)
                throw new FormatException();

            var builder = new NpgsqlConnectionStringBuilder {
                Host = uri.Host, Port = uri.Port > 0 ? uri.Port : 5432,
                Username = Uri.UnescapeDataString(credentials[0]),
                Password = Uri.UnescapeDataString(credentials[1]),
                Database = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/')),
                SslMode = SslMode.Require,
                MaxPoolSize = 10,
            };
            foreach (var pair in uri.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries))
            {
                var parts = pair.Split('=', 2);
                if (parts.Length != 2) throw new FormatException();
                var key = Uri.UnescapeDataString(parts[0]);
                var parameter = Uri.UnescapeDataString(parts[1]);
                if (key.Equals("sslmode", StringComparison.OrdinalIgnoreCase))
                    builder.SslMode = parameter.ToLowerInvariant() switch {
                        "disable" => SslMode.Disable, "allow" => SslMode.Allow, "prefer" => SslMode.Prefer,
                        "require" => SslMode.Require, "verify-ca" => SslMode.VerifyCA, "verify-full" => SslMode.VerifyFull,
                        _ => throw new FormatException(),
                    };
                else builder[key] = parameter;
            }
            return builder.ConnectionString;
        }
        catch (Exception exception) when (exception is ArgumentException or FormatException or KeyNotFoundException)
        {
            // Never include a connection URL or its credentials in error messages.
            throw new InvalidOperationException("A conexão PostgreSQL é inválida. Confira DATABASE_URL ou ConnectionStrings__Postgres.");
        }
    }
}
