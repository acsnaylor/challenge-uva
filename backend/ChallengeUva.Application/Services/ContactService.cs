using System.ComponentModel.DataAnnotations;
using ChallengeUva.Domain.Entities;
using ChallengeUva.Domain.Requests;
using ChallengeUva.Domain.Responses;
using ChallengeUva.Infrastructure.Data.Contexts;

namespace ChallengeUva.Application.Services;

public class ContactService
{
    private readonly ChallengeUvaContext db;
    public ContactService(ChallengeUvaContext db) => this.db = db;

    public async Task<ContactMessageReceipt> ReceiveAsync(ContactMessageRequest request, CancellationToken cancellationToken = default)
    {
        request.Name = request.Name?.Trim() ?? "";
        request.Email = request.Email?.Trim().ToLowerInvariant() ?? "";
        request.Subject = request.Subject?.Trim() ?? "";
        request.Message = request.Message?.Trim() ?? "";
        var errors = new List<ValidationResult>();
        if (!Validator.TryValidateObject(request, new ValidationContext(request), errors, true))
            throw new ShopException(string.Join(" ", errors.Select(error => error.ErrorMessage)));

        var message = new ContactMessage {
            Name = request.Name, Email = request.Email, Subject = request.Subject, Message = request.Message,
        };
        db.ContactMessages.Add(message);
        await db.SaveChangesAsync(cancellationToken);
        return new ContactMessageReceipt(message.Id, message.CreatedAt,
            "Mensagem recebida com sucesso. Obrigada por falar com a Doce Ateliê!");
    }
}
