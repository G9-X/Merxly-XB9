using merxly.Application.DTOs.Auth;
using merxly.Application.Interfaces;
using merxly.Application.Interfaces.Services;
using merxly.Application.Settings;
using merxly.Domain.Constants;
using merxly.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace merxly.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly JwtSettings _jwtSettings;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IUnitOfWork unitOfWork,
            IHttpContextAccessor httpContextAccessor,
            IOptions<JwtSettings> jwtSettings,
            ILogger<AuthService> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
            _jwtSettings = jwtSettings.Value;
            _logger = logger;
        }

        public async Task<LoginResponseDto> RegisterAsync(RegisterDto registerDto, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Registration attempt for email: {Email}", registerDto.Email);

            var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
            if (existingUser != null)
            {
                _logger.LogWarning("Registration failed: Email already exists: {Email}", registerDto.Email);
                throw new InvalidOperationException("Email already exists.");
            }

            var user = new ApplicationUser
            {
                UserName = registerDto.Email,
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                IsActive = true,
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                _logger.LogError("Registration failed for email {Email}: {Errors}", registerDto.Email, errors);
                throw new InvalidOperationException($"Registration failed: {errors}");
            }

            await _userManager.AddToRoleAsync(user, UserRoles.Customer);
            _logger.LogInformation("User registered successfully: {Email}", registerDto.Email);

            return await GenerateAuthResponseAsync(user, cancellationToken);
        }

        public async Task<LoginResponseDto> LoginAsync(LoginDto loginDto, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Login attempt for email: {Email}", loginDto.Email);

            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("Login failed: User not found or inactive for email: {Email}", loginDto.Email);
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, lockoutOnFailure: false);
            if (!result.Succeeded)
            {
                _logger.LogWarning("Login failed: Invalid password for email: {Email}", loginDto.Email);
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            _logger.LogInformation("User logged in successfully: {Email}", loginDto.Email);

            return await GenerateAuthResponseAsync(user, cancellationToken);
        }

        public async Task<LoginResponseDto> RefreshTokenAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Refresh token attempt");

            var httpContext = GetHttpContext();
            string? refreshToken = httpContext.Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
            {
                _logger.LogWarning("Refresh token failed: No refresh token provided");
                throw new UnauthorizedAccessException("No refresh token provided.");
            }

            var storedToken = await _unitOfWork.RefreshToken.GetFirstOrDefaultAsync(
                rt => rt.Token == refreshToken,
                cancellationToken);

            if (storedToken == null || !storedToken.IsActive)
            {
                _logger.LogWarning("Refresh token failed: Invalid or inactive token");
                throw new UnauthorizedAccessException("Invalid or expired refresh token.");
            }

            var user = await _userManager.FindByIdAsync(storedToken.UserId);
            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("Refresh token failed: User not found or inactive");
                throw new UnauthorizedAccessException("Invalid refresh token.");
            }

            storedToken.RevokedAt = DateTime.UtcNow;
            _unitOfWork.RefreshToken.Update(storedToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Token refreshed successfully for user: {UserId}", user.Id);
            return await GenerateAuthResponseAsync(user, cancellationToken);
        }

        public async Task RevokeTokenAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Revoke token attempt");

            var httpContext = GetHttpContext();
            string? refreshToken = httpContext.Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
            {
                _logger.LogWarning("Revoke token failed: No refresh token provided");
                throw new UnauthorizedAccessException("No refresh token provided.");
            }

            var storedToken = await _unitOfWork.RefreshToken.GetFirstOrDefaultAsync(
                rt => rt.Token == refreshToken,
                cancellationToken);

            if (storedToken == null)
            {
                _logger.LogWarning("Revoke token failed: Token not found");
                throw new InvalidOperationException("Token not found.");
            }

            if (storedToken.IsRevoked)
            {
                _logger.LogWarning("Revoke token failed: Token already revoked");
                return;
            }

            storedToken.RevokedAt = DateTime.UtcNow;
            _unitOfWork.RefreshToken.Update(storedToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Token revoked successfully");
        }

        private async Task<LoginResponseDto> GenerateAuthResponseAsync(ApplicationUser user, CancellationToken cancellationToken)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var accessToken = GenerateAccessToken(user, roles);
            var refreshToken = await GenerateAndSaveRefreshTokenAsync(user.Id, cancellationToken);
            SetRefreshTokenCookie(refreshToken);
            var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpiryInMinutes);

            return new LoginResponseDto
            {
                AccessToken = accessToken,
                ExpiresAt = expiresAt,
                UserId = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AvatarPublicId = user.AvatarPublicId,
                Roles = roles
            };
        }

        private string GenerateAccessToken(ApplicationUser user, IList<string> roles)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.GivenName, user.FirstName),
                new Claim(ClaimTypes.Surname, user.LastName),
                new Claim("avatar_public_id", user.AvatarPublicId ?? ""),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpiryInMinutes);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: expires,
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task<string> GenerateAndSaveRefreshTokenAsync(string userId, CancellationToken cancellationToken)
        {
            var randomBytes = new byte[64];
            var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            var refreshToken = Convert.ToBase64String(randomBytes);

            var tokenEntity = new RefreshToken
            {
                Token = refreshToken,
                UserId = userId,
                ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryInDays),
            };

            await _unitOfWork.RefreshToken.AddAsync(tokenEntity, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return refreshToken;
        }

        private void SetRefreshTokenCookie(string refreshToken)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryInDays)
            };

            var httpContext = GetHttpContext();
            httpContext.Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
        }

        private HttpContext GetHttpContext()
        {
            return _httpContextAccessor.HttpContext
                ?? throw new InvalidOperationException("HTTP context is not available.");
        }
    }
}
