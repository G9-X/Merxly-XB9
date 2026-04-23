using merxly.Domain.Interfaces;

namespace merxly.Domain.Entities
{
    public class ChatMessage : ICreatedDate
    {
        public Guid Id { get; set; }
        public Guid ThreadId { get; set; }
        public string Role { get; set; } = null!;   // "user" | "assistant"
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; }

        public ChatThread Thread { get; set; } = null!;
    }
}
