using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace ChallengeUva.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    var port = Environment.GetEnvironmentVariable("PORT");
                    if (!string.IsNullOrWhiteSpace(port))
                    {
                        if (!int.TryParse(port, out var number) || number < 1 || number > 65535)
                            throw new InvalidOperationException("PORT deve ser uma porta válida.");
                        webBuilder.UseUrls($"http://0.0.0.0:{number}");
                    }
                    webBuilder.UseStartup<Startup>();
                });
    }
}
