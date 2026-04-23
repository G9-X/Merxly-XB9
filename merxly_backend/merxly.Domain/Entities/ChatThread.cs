using merxly.Domain.Interfaces;

namespace merxly.Domain.Entities
{
    public class ChatThread : ICreatedDate, IModifiedDate
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = null!;
        public string Title { get; set; } = "New Chat";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public ApplicationUser User { get; set; } = null!;
        public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}
