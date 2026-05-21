using System.Text.Json.Serialization;

namespace merxly.Application.DTOs.AiChat
{
  public class AiChatResponseDto
  {
    [JsonPropertyName("answer")]
    public string Answer { get; set; } = string.Empty;
  }
}