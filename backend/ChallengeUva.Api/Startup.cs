using ChallengeUva.Api.Extensions;
using ChallengeUva.Application.Services;
using ChallengeUva.Domain.Entities;
using ChallengeUva.Infrastructure.Data.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Text.Json;
using ChallengeUva.Api.Health;

namespace ChallengeUva.Api;

public class Startup
{
    public IConfiguration Configuration { get; }
    private readonly IWebHostEnvironment environment;
    public Startup(IConfiguration configuration, IWebHostEnvironment environment)
    {
        Configuration = configuration;
        this.environment = environment;
    }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddShopDatabase(Configuration);
        services.AddDIRepository();
        services.AddScoped<ShopService>();
        services.AddScoped<ContactService>();
        services.AddControllers();
        services.AddHealthChecks().AddCheck<DatabaseHealthCheck>("database");
        services.AddCors(options => options.AddDefaultPolicy(policy => policy
            .WithOrigins(Configuration.GetSection("AllowedOrigins").Get<string[]>()
                ?? (environment.IsDevelopment() ? new[] { "http://localhost:5173" } : Array.Empty<string>()))
            .AllowAnyHeader().AllowAnyMethod()));
        services.AddSwaggerGen(c => c.SwaggerDoc("v1", new OpenApiInfo { Title = "Doce Ateliê — Cupcakes Gourmet", Version = "v1" }));
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ChallengeUvaContext db)
    {
        if (db.Database.IsRelational()) db.Database.Migrate();
        else db.Database.EnsureCreated();
        if (!db.Products.Any())
        {
            db.Products.AddRange(
                new Product { Name = "Chocolate Belga", Description = "Massa de cacau, recheio de ganache belga e cobertura cremosa de chocolate.", Price = 16.90m, ImageUrl = "/images/chocolate.svg" },
                new Product { Name = "Red Velvet", Description = "Massa aveludada de cacau com um delicado frosting de cream cheese.", Price = 18.50m, ImageUrl = "/images/red-velvet.svg" },
                new Product { Name = "Baunilha & Morango", Description = "Baunilha com compota artesanal de morangos e buttercream de fruta.", Price = 15.90m, ImageUrl = "/images/morango.svg" },
                new Product { Name = "Limão Siciliano", Description = "Massa leve, curd de limão siciliano e uma nuvem de merengue.", Price = 17.00m, ImageUrl = "/images/limao.svg" });
            db.SaveChanges();
        }
        app.Use(async (context, next) => {
            try { await next(); }
            catch (Exception ex) {
                var status = ex is ShopException shop ? shop.Status : ex is DbUpdateException ? 409 : 500;
                if (status == 500) context.RequestServices.GetRequiredService<ILogger<Startup>>().LogError(ex, "Erro na loja");
                context.Response.StatusCode = status;
                context.Response.ContentType = "application/problem+json";
                await context.Response.WriteAsync(JsonSerializer.Serialize(new {
                    status, title = status == 500 ? "Não foi possível concluir a operação. Tente novamente." :
                        ex is ShopException ? ex.Message : "Os dados foram alterados por outra operação. Atualize a página e tente novamente."
                }));
            }
        });
        app.UseSwagger();
        app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Doce Ateliê v1"));
        app.UseRouting();
        app.UseCors();
        app.UseEndpoints(endpoints => {
            endpoints.MapControllers();
            endpoints.MapHealthChecks("/health");
        });
    }
}
