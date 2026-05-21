using merxly.Application.DTOs.AiChat;

namespace merxly.Application.Interfaces.Services
{
  public interface IAiChatService
  {
    Task<AiChatResponseDto> GetAnswerAsync(AiChatRequestDto request, CancellationToken cancellationToken = default);
  }
}