using ChallengeUva.Application.Interfaces;
using ChallengeUva.Domain.Entities;
using ChallengeUva.Domain.Responses;
using ChallengeUva.Infrastructure.Data.Repositories;
using System.Net;

namespace ChallengeUva.Application.Services
{
    public class SuperpowerService : ISuperpowerService
    {
        private readonly IRepositoryAsync<Superpower> _superpowerRepository;

        public SuperpowerService(IRepositoryAsync<Superpower> superpowerRepository)
        {
            _superpowerRepository = superpowerRepository;
        }

        public async Task<ApiResponse<IEnumerable<SuperpowerResponse>>> ListAsync(CancellationToken cancellationToken)
        {
            var list = await _superpowerRepository.GetAllAsync(cancellationToken: cancellationToken);
            if (list == null || !list.Any())
            {
                return new ApiResponse<IEnumerable<SuperpowerResponse>>(HttpStatusCode.NotFound, null, new Dictionary<string, string> { { "Superpowers", "Nenhum superpoder cadastrado." } });
            }

            var mapped = list.Select(s => new SuperpowerResponse
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description
            }).ToList();

            return new ApiResponse<IEnumerable<SuperpowerResponse>>(HttpStatusCode.OK, mapped);
        }
    }
}


