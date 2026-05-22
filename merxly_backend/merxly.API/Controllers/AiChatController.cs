using merxly.Application.DTOs.AiChat;
using merxly.Application.DTOs.Common;
using merxly.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace merxly.API.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class AiChatController : BaseApiController
  {
    private readonly IAiChatService _aiChatService;

    public AiChatController(IAiChatService aiChatService)
    {
      _aiChatService = aiChatService;
    }

    [HttpPost("ask")]
    [AllowAnonymous]
    public async Task<ActionResult<ResponseDto<AiChatResponseDto>>> Ask([FromBody] AiChatRequestDto request, CancellationToken cancellationToken)
    {
      if (string.IsNullOrWhiteSpace(request.Question))
      {
        return BadRequestResponse<AiChatResponseDto>("Question cannot be empty.");
      }

      try
      {
        var result = await _aiChatService.GetAnswerAsync(request, cancellationToken);
        return OkResponse(result);
      }
      catch (Exception ex)
      {
        return BadRequestResponse<AiChatResponseDto>($"Error calling AI: {ex.Message}");
      }
    }
  }
}
