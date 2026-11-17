using System.ComponentModel.DataAnnotations;

namespace ChallengeUva.Domain.Requests;

public class ContactMessageRequest
{
    [Required(ErrorMessage = "Informe seu nome."), StringLength(100, MinimumLength = 2, ErrorMessage = "O nome deve ter de 2 a 100 caracteres.")]
    public string Name { get; set; } = "";

    [Required(ErrorMessage = "Informe seu e-mail."), EmailAddress(ErrorMessage = "Informe um e-mail válido."), StringLength(254)]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Informe o assunto."), StringLength(150, ErrorMessage = "O assunto deve ter até 150 caracteres.")]
    public string Subject { get; set; } = "";

    [Required(ErrorMessage = "Escreva sua mensagem."), StringLength(3000, ErrorMessage = "A mensagem deve ter até 3000 caracteres.")]
    public string Message { get; set; } = "";
}
