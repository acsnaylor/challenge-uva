using ChallengeUva.Application.Services;
using ChallengeUva.Domain.Requests;
using ChallengeUva.Domain.Responses;
using Microsoft.AspNetCore.Mvc;

namespace ChallengeUva.Api.Controllers;

[ApiController, Route("api/contact-messages")]
public class ContactMessagesController : ControllerBase
{
    private readonly ContactService service;
    public ContactMessagesController(ContactService service) => this.service = service;

    [HttpPost]
    [ProducesResponseType(typeof(ContactMessageReceipt), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(ContactMessageRequest request, CancellationToken cancellationToken) =>
        StatusCode(StatusCodes.Status201Created, await service.ReceiveAsync(request, cancellationToken));
}
