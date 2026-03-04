using merxly.Application.DTOs.Auth;
using merxly.Application.DTOs.Common;
using merxly.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace merxly.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : BaseApiController
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<ResponseDto<LoginResponseDto>>> Register([FromBody] RegisterDto registerDto, CancellationToken cancellationToken = default)
        {
            var result = await _authService.RegisterAsync(registerDto, cancellationToken);
            return StatusCode(201, new ResponseDto<LoginResponseDto>
            {
                Data = result,
                IsSuccess = true,
                Message = "Registered successfully",
                StatusCode = 201,
                Errors = null
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<ResponseDto<LoginResponseDto>>> Login([FromBody] LoginDto loginDto, CancellationToken cancellationToken)
        {
            var result = await _authService.LoginAsync(loginDto, cancellationToken);
            return OkResponse(result, "Login successfully");
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<ResponseDto<LoginResponseDto>>> RefreshToken(CancellationToken cancellationToken)
        {
            var result = await _authService.RefreshTokenAsync(cancellationToken);
            return OkResponse(result, "Token refreshed successfully");
        }

        [HttpPost("revoke-token")]
        public async Task<ActionResult> RevokeToken(CancellationToken cancellationToken)
        {
            await _authService.RevokeTokenAsync(cancellationToken);
            return NoContent();
        }
    }
}
