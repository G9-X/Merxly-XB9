using System.Net.Http.Json;
using System.Text.Json;
using merxly.Application.DTOs.AiChat;
using merxly.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;

namespace merxly.Infrastructure.Services
{
  public class AiChatService : IAiChatService
  {
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public AiChatService(HttpClient httpClient, IConfiguration configuration)
    {
      _httpClient = httpClient;
      _configuration = configuration;
    }

    public async Task<AiChatResponseDto> GetAnswerAsync(AiChatRequestDto request, CancellationToken cancellationToken = default)
    {
      var apiUrl = _configuration["AiChat:ApiGatewayUrl"];
      var apiKey = _configuration["AiChat:ApiGatewayKey"];

      if (string.IsNullOrEmpty(apiUrl) || string.IsNullOrEmpty(apiKey))
      {
        throw new InvalidOperationException("AiChat configuration is missing.");
      }

      var httpRequest = new HttpRequestMessage(HttpMethod.Post, apiUrl)
      {
        Content = JsonContent.Create(request)
      };

      // Add API Gateway Key
      httpRequest.Headers.Add("x-api-key", apiKey);

      var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
      response.EnsureSuccessStatusCode();

      var data = await response.Content.ReadFromJsonAsync<AiChatResponseDto>(cancellationToken: cancellationToken);

      return data ?? new AiChatResponseDto { Answer = "Kh�ng c� ph?n h?i t? AI." };
    }
  }
}
