using FluentValidation;
using merxly.Application.DTOs.Common;
using merxly.Domain.Exceptions;

namespace merxly.API.Middlewares
{
    public class GlobalExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

        public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning(ex, "Validation failed: {Errors}", string.Join(", ", ex.Errors));
                await HandleExceptionAsync(context, ex, StatusCodes.Status400BadRequest, "Validation failed", ex.Errors.Select(e => e.ErrorMessage).ToList());
            }
            catch (ConflictException ex)
            {
                _logger.LogWarning(ex, "Conflict occurred: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex, StatusCodes.Status409Conflict, ex.Message);
            }
            catch (ForbiddenAccessException ex)
            {
                _logger.LogWarning(ex, "Forbidden access attempt: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex, StatusCodes.Status403Forbidden, ex.Message);
            }
            catch (NotFoundException ex)
            {
                _logger.LogWarning(ex, "Resource not found: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex, StatusCodes.Status404NotFound, ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex, StatusCodes.Status401Unauthorized, ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation attempt: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex, StatusCodes.Status400BadRequest, ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred");
                await HandleExceptionAsync(context, ex, StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception, int statusCode, string message, List<string>? errors = null)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            var response = new ResponseDto<object>
            {
                Data = null,
                IsSuccess = false,
                Message = message,
                StatusCode = statusCode,
                Errors = errors ?? (statusCode == 500 ? new List<string> { "Internal server error" } : new List<string> { exception.Message })
            };

            await context.Response.WriteAsJsonAsync(response);
        }
    }
}
