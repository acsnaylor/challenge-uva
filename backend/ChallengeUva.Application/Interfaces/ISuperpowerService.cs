using ChallengeUva.Domain.Responses;

namespace ChallengeUva.Application.Interfaces
{
    public interface ISuperpowerService
    {
        Task<ApiResponse<IEnumerable<SuperpowerResponse>>> ListAsync(CancellationToken cancellationToken);
    }
}


