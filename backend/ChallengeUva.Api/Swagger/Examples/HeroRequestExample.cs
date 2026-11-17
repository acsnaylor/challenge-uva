using ChallengeUva.Domain.Requests;
using Swashbuckle.AspNetCore.Filters;

namespace ChallengeUva.Api.Swagger.Examples
{
    public class HeroRequestExample : IExamplesProvider<HeroRequest>
    {
        public HeroRequest GetExamples()
        {
            return new HeroRequest
            {
                Name = "Bruce Wayne",
                HeroName = "Batman",
                BirthDate = new DateTime(1972, 2, 19),
                Height = 1.88,
                Weight = 95.0,
                SuperpowerIds = new List<int> { 1, 3 }
            };
        }
    }
}


