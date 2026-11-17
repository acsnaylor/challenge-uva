using ChallengeUva.Infrastructure.Data.Repositories;

namespace ChallengeUva.Api.Extensions
{
    public static class DependencyInjectionRepository
    {
        public static IServiceCollection AddDIRepository(this IServiceCollection services)
        {
            services.AddTransient(typeof(IRepositoryAsync<>), typeof(RepositoryAsync<>));

            return services;
        }
    }
}
