using ChallengeUva.Application.Interfaces;
using ChallengeUva.Application.Services;

namespace ChallengeUva.Api.Extensions
{
    public static class DependencyInjectionApplication
    {
        public static IServiceCollection AddDIApplication(this IServiceCollection services)
        {
            services.AddTransient<IHeroService, HeroService>();
            services.AddTransient<ISuperpowerService, SuperpowerService>();
            return services;
        }
    }
}


