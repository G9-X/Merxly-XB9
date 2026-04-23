using merxly.Domain.Entities;
using merxly.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace merxly.API.Controllers
{
    [ApiController]
    [Route("api/chat/threads")]
    [Authorize]
    public class ChatThreadsController : BaseApiController
    {
        private readonly ApplicationDbContext _db;

        public ChatThreadsController(ApplicationDbContext db) => _db = db;

        // GET /api/chat/threads
        [HttpGet]
        public async Task<IActionResult> List(CancellationToken ct)
        {
            var userId = GetUserIdFromClaims();
            var threads = await _db.ChatThreads
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.UpdatedAt ?? t.CreatedAt)
                .Select(t => new { t.Id, t.Title, t.CreatedAt, t.UpdatedAt })
                .ToListAsync(ct);
            return Ok(threads);
        }

        // POST /api/chat/threads
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateThreadRequest req, CancellationToken ct)
        {
            var userId = GetUserIdFromClaims();
            var thread = new ChatThread { Id = Guid.NewGuid(), UserId = userId, Title = req.Title ?? "New Chat" };
            _db.ChatThreads.Add(thread);
            await _db.SaveChangesAsync(ct);
            return Ok(new { thread.Id, thread.Title, thread.CreatedAt, thread.UpdatedAt });
        }

        // GET /api/chat/threads/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> Get(Guid id, CancellationToken ct)
        {
            var userId = GetUserIdFromClaims();
            var thread = await _db.ChatThreads
                .Include(t => t.Messages.OrderBy(m => m.CreatedAt))
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, ct);
            if (thread is null) return NotFound();
            return Ok(new
            {
                thread.Id, thread.Title, thread.CreatedAt, thread.UpdatedAt,
                messages = thread.Messages.Select(m => new { m.Id, m.Role, m.Content, m.CreatedAt })
            });
        }

        // POST /api/chat/threads/{id}/messages
        [HttpPost("{id:guid}/messages")]
        public async Task<IActionResult> AppendMessage(Guid id, [FromBody] AppendMessageRequest req, CancellationToken ct)
        {
            var userId = GetUserIdFromClaims();
            var thread = await _db.ChatThreads.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, ct);
            if (thread is null) return NotFound();

            var message = new merxly.Domain.Entities.ChatMessage { Id = Guid.NewGuid(), ThreadId = id, Role = req.Role, Content = req.Content };
            _db.ChatMessages.Add(message);

            // Update thread title from first user message if still default
            if (thread.Title == "New Chat" && req.Role == "user")
                thread.Title = req.Content.Length > 60 ? req.Content[..60] + "…" : req.Content;

            await _db.SaveChangesAsync(ct);
            return Ok(new { message.Id, message.Role, message.Content, message.CreatedAt });
        }

        // DELETE /api/chat/threads/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
        {
            var userId = GetUserIdFromClaims();
            var thread = await _db.ChatThreads.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, ct);
            if (thread is null) return NotFound();
            _db.ChatThreads.Remove(thread);
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }
    }

    public record CreateThreadRequest(string? Title);
    public record AppendMessageRequest(string Role, string Content);
}
