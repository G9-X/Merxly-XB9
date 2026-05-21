using System.Text.Json.Serialization;

namespace merxly.Application.DTOs.AiChat
{
  public class AiChatRequestDto
  {
    [JsonPropertyName("question")]
    public string Question { get; set; } = string.Empty;

    [JsonPropertyName("session_id")]
    public string SessionId { get; set; } = string.Empty;
  }
}
