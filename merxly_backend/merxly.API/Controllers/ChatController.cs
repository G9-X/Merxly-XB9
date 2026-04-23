using Amazon;
using Amazon.BedrockRuntime;
using Amazon.BedrockRuntime.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace merxly.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public ChatController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost]
        public async Task Stream([FromBody] ChatRequest request, CancellationToken cancellationToken)
        {
            var region = _configuration["Bedrock:Region"] ?? "us-east-1";
            var modelId = _configuration["Bedrock:ModelId"] ?? "anthropic.claude-3-5-sonnet-20241022-v2:0";

            var client = new AmazonBedrockRuntimeClient(RegionEndpoint.GetBySystemName(region));

            var messages = request.Messages
                .Where(m => m.Role != "system")
                .Select(m => new { role = m.Role, content = m.Content })
                .ToList();

            var body = JsonSerializer.Serialize(new
            {
                anthropic_version = "bedrock-2023-05-31",
                max_tokens = 4096,
                messages
            });

            var invokeRequest = new InvokeModelWithResponseStreamRequest
            {
                ModelId = modelId,
                ContentType = "application/json",
                Accept = "application/json",
                Body = new MemoryStream(Encoding.UTF8.GetBytes(body))
            };

            Response.ContentType = "text/event-stream";
            Response.Headers.CacheControl = "no-cache";
            Response.Headers.Connection = "keep-alive";

            var streamingResponse = await client.InvokeModelWithResponseStreamAsync(invokeRequest, cancellationToken);

            foreach (var item in streamingResponse.Body)
            {
                if (item is not PayloadPart payload) continue;

                using var doc = JsonDocument.Parse(payload.Bytes);
                var root = doc.RootElement;

                if (root.TryGetProperty("type", out var type) &&
                    type.GetString() == "content_block_delta" &&
                    root.TryGetProperty("delta", out var delta) &&
                    delta.TryGetProperty("text", out var text))
                {
                    var chunk = JsonSerializer.Serialize(new { content = text.GetString() });
                    await Response.WriteAsync($"data: {chunk}\n\n", cancellationToken);
                    await Response.Body.FlushAsync(cancellationToken);
                }
            }
        }
    }

    public record ChatInputMessage(string Role, string Content);
    public record ChatRequest(IEnumerable<ChatInputMessage> Messages);
}
