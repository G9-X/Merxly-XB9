namespace merxly.Application.DTOs.Auth
{
    public record LoginResponseDto
    {
        public string AccessToken { get; init; }
        public DateTime ExpiresAt { get; init; }
        public string UserId { get; init; }
        public string Email { get; init; }
        public string FirstName { get; init; }
        public string LastName { get; init; }
        public string? AvatarPublicId { get; init; }
        public IList<string> Roles { get; init; }
    }
}
