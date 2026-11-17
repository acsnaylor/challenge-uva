FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/ChallengeUva.Api/ChallengeUva.Api.csproj backend/ChallengeUva.Api/
COPY backend/ChallengeUva.Application/ChallengeUva.Application.csproj backend/ChallengeUva.Application/
COPY backend/ChallengeUva.Domain/ChallengeUva.Domain.csproj backend/ChallengeUva.Domain/
COPY backend/ChallengeUva.Infrastructure/ChallengeUva.Infrastructure.csproj backend/ChallengeUva.Infrastructure/
COPY backend/ChallengeUva.Shared/ChallengeUva.Shared.csproj backend/ChallengeUva.Shared/
RUN dotnet restore backend/ChallengeUva.Api/ChallengeUva.Api.csproj
COPY backend/ backend/
RUN dotnet publish backend/ChallengeUva.Api/ChallengeUva.Api.csproj -c Release -o /app/publish --no-restore /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
USER app
ENTRYPOINT ["dotnet", "ChallengeUva.Api.dll"]
