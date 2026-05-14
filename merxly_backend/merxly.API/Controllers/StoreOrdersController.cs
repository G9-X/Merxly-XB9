using System.IO;
using System.Text;
using merxly.Application.DTOs.Common;
using merxly.Application.DTOs.Order;
using merxly.Application.Interfaces.Repositories;
using merxly.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace merxly.API.Controllers
{
    [Route("api/store/orders")]
    [ApiController]
    [Authorize]
    public class StoreOrdersController : BaseApiController
    {
        private readonly IStoreOrderService _storeOrderService;
        private readonly IStoreRepository _storeRepository;

        public StoreOrdersController(
            IStoreOrderService storeOrderService,
            IStoreRepository storeRepository)
        {
            _storeOrderService = storeOrderService;
            _storeRepository = storeRepository;
        }

        /// <summary>
        /// Export orders to a CSV file stored on EFS for Week 5 evidence.
        /// Path: /mnt/efs/exports/orders.csv
        /// </summary>
        [HttpPost("export")]
        public async Task<ActionResult<ResponseDto<string>>> ExportOrders(CancellationToken cancellationToken = default)
        {
            var storeId = await GetStoreIdForCurrentUserAsync(_storeRepository, cancellationToken);
            if (storeId == null) return ForbiddenResponse<string>();

            // Get the first 100 orders for export
            var filter = new StoreSubOrderFilterDto { PageNumber = 1, PageSize = 100 };
            var result = await _storeOrderService.GetStoreOrdersAsync(storeId.Value, filter, cancellationToken);

            var exportDir = "/mnt/efs/exports";
            var filePath = Path.Combine(exportDir, $"orders_{DateTime.UtcNow:yyyyMMdd}.csv");

            try
            {
                if (!Directory.Exists(exportDir))
                {
                    Directory.CreateDirectory(exportDir);
                }

                var csv = new StringBuilder();
                csv.AppendLine("OrderNumber,Customer,Total,Status,CreatedAt");

                foreach (var order in result.Items)
                {
                    csv.AppendLine($"{order.SubOrderNumber},{order.CustomerName},{order.TotalAmount},{order.Status},{order.CreatedAt}");
                }

                await System.IO.File.WriteAllTextAsync(filePath, csv.ToString(), Encoding.UTF8, cancellationToken);

                return OkResponse(filePath, $"Orders exported successfully to {filePath}");
            }
            catch (Exception ex)
            {
                return BadRequestResponse<string>($"Failed to export: {ex.Message}");
            }
        }

        /// <summary>
        /// Get paginated list of orders for the authenticated store owner.
        /// Supports filtering by status, order numbers, and date range.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ResponseDto<PaginatedResultDto<StoreSubOrderDto>>>> GetStoreOrders(
            [FromQuery] StoreSubOrderFilterDto filter,
            CancellationToken cancellationToken = default)
        {
            var storeId = await GetStoreIdForCurrentUserAsync(_storeRepository, cancellationToken);

            var result = await _storeOrderService.GetStoreOrdersAsync(storeId.Value, filter, cancellationToken);
            return OkResponse(result, "Orders retrieved successfully");
        }

        /// <summary>
        /// Get detailed information about a specific sub-order.
        /// </summary>
        [HttpGet("{subOrderId}")]
        public async Task<ActionResult<ResponseDto<StoreSubOrderDetailDto>>> GetStoreOrderById(
            Guid subOrderId,
            CancellationToken cancellationToken = default)
        {
            var storeId = await GetStoreIdForCurrentUserAsync(_storeRepository, cancellationToken);

            var result = await _storeOrderService.GetStoreOrderByIdAsync(storeId.Value, subOrderId, cancellationToken);
            return OkResponse(result, "Order retrieved successfully");
        }

        /// <summary>
        /// Update the status of a sub-order.
        /// Allowed transitions:
        /// - Confirmed -> Processing (store preparing items)
        /// - Processing -> Delivering (items being delivered)
        /// - Delivering -> Shipped (delivered to customer)
        /// - Confirmed -> Cancelled (store refuses order)
        /// </summary>
        [HttpPatch("{subOrderId}/status")]
        public async Task<ActionResult<ResponseDto<StoreSubOrderDetailDto>>> UpdateSubOrderStatus(
            Guid subOrderId,
            [FromBody] UpdateSubOrderStatusDto dto,
            CancellationToken cancellationToken = default)
        {
            var storeId = await GetStoreIdForCurrentUserAsync(_storeRepository, cancellationToken);

            var result = await _storeOrderService.UpdateSubOrderStatusAsync(storeId.Value, subOrderId, dto, cancellationToken);
            return OkResponse(result, "Order status updated successfully");
        }
    }
}
