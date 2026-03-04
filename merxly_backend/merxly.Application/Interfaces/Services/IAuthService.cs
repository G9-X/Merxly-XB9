using merxly.Application.DTOs.Auth;

namespace merxly.Application.Interfaces.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto> RegisterAsync(RegisterDto registerDto, CancellationToken cancellationToken);
        Task<LoginResponseDto> LoginAsync(LoginDto loginDto, CancellationToken cancellationToken);
        Task<LoginResponseDto> RefreshTokenAsync(CancellationToken cancellationToken);
        Task RevokeTokenAsync(CancellationToken cancellationToken);
    }
}
