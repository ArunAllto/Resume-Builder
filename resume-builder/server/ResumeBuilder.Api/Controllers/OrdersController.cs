using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeBuilder.Api.Data;
using ResumeBuilder.Api.Models;
using ResumeBuilder.Api.Models.DTOs;
using ResumeBuilder.Api.Services;
using Microsoft.Extensions.Options;

namespace ResumeBuilder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "UserOnly")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly PaymentService _paymentService;
    private readonly RazorpaySettings _razorpaySettings;

    public OrdersController(
        AppDbContext context,
        PaymentService paymentService,
        IOptions<RazorpaySettings> razorpayOptions)
    {
        _context = context;
        _paymentService = paymentService;
        _razorpaySettings = razorpayOptions.Value;
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, error = "User not authenticated" });

        // Find template
        var template = await _context.Templates.FindAsync(dto.TemplateId);
        if (template == null)
            return NotFound(new { success = false, error = "Template not found" });

        if (template.IsFree)
            return BadRequest(new { success = false, error = "This template is free, no payment required" });

        // Check if already purchased
        var alreadyPurchased = await _context.UserPurchases
            .AnyAsync(p => p.UserId == userId && p.TemplateId == dto.TemplateId);
        if (alreadyPurchased)
            return BadRequest(new { success = false, error = "You have already purchased this template" });

        // Check for existing pending order
        var existingOrder = await _context.Orders
            .FirstOrDefaultAsync(o => o.UserId == userId && o.TemplateId == dto.TemplateId && o.Status == "Pending" && o.PaymentGateway == dto.PaymentGateway);

        if (existingOrder != null)
        {
            return Ok(new
            {
                success = true,
                data = new
                {
                    orderId = existingOrder.Id,
                    orderNumber = existingOrder.OrderNumber,
                    amount = existingOrder.Amount,
                    discountAmount = existingOrder.DiscountAmount,
                    finalAmount = existingOrder.FinalAmount,
                    currency = existingOrder.Currency,
                    gateway = existingOrder.PaymentGateway,
                    gatewayOrderId = existingOrder.GatewayOrderId,
                    razorpayKeyId = existingOrder.PaymentGateway == "razorpay" ? _razorpaySettings.KeyId : null,
                    stripeClientSecret = existingOrder.PaymentGateway == "stripe" ? existingOrder.GatewayOrderId : null
                }
            });
        }

        // Calculate price
        var price = template.OfferPrice ?? template.OriginalPrice ?? 0;
        decimal discountAmount = 0;
        Guid? couponId = null;
        string? couponCode = null;

        // Apply coupon if provided
        if (!string.IsNullOrWhiteSpace(dto.CouponCode))
        {
            var coupon = await _context.Coupons
                .FirstOrDefaultAsync(c => c.Code.ToUpper() == dto.CouponCode.ToUpper());

            if (coupon != null && coupon.IsActive
                && (!coupon.ExpiresAt.HasValue || coupon.ExpiresAt.Value > DateTime.UtcNow)
                && coupon.CurrentUses < coupon.MaxUses)
            {
                couponId = coupon.Id;
                couponCode = coupon.Code;

                if (coupon.DiscountType == "percent")
                    discountAmount = Math.Round(price * coupon.DiscountValue / 100, 2);
                else
                    discountAmount = coupon.DiscountValue;

                discountAmount = Math.Min(discountAmount, price); // Can't discount more than price
            }
        }

        var finalAmount = Math.Max(0, price - discountAmount);

        // Generate unique order number
        var orderNumber = await GenerateOrderNumber();

        // If free after coupon
        if (finalAmount <= 0)
        {
            var freeOrder = new Order
            {
                OrderNumber = orderNumber,
                UserId = userId,
                TemplateId = dto.TemplateId,
                Amount = price,
                DiscountAmount = discountAmount,
                CouponId = couponId,
                CouponCode = couponCode,
                FinalAmount = 0,
                Status = "Success",
                PaymentGateway = "coupon",
                PaidAt = DateTime.UtcNow
            };

            _context.Orders.Add(freeOrder);

            // Create purchase record
            _context.UserPurchases.Add(new UserPurchase
            {
                UserId = userId,
                TemplateId = dto.TemplateId,
                Amount = 0
            });

            // Increment coupon usage
            if (couponId.HasValue)
            {
                var coupon = await _context.Coupons.FindAsync(couponId.Value);
                if (coupon != null) coupon.CurrentUses++;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                data = new
                {
                    orderId = freeOrder.Id,
                    orderNumber = freeOrder.OrderNumber,
                    amount = freeOrder.Amount,
                    discountAmount = freeOrder.DiscountAmount,
                    finalAmount = freeOrder.FinalAmount,
                    status = "Success",
                    gateway = "coupon",
                    message = "100% discount applied. Template unlocked!"
                }
            });
        }

        // Create gateway order
        string? gatewayOrderId = null;
        string? stripeClientSecret = null;

        try
        {
            if (dto.PaymentGateway == "stripe")
            {
                var (intentId, clientSecret) = await _paymentService.CreateStripePaymentIntentAsync(finalAmount);
                gatewayOrderId = intentId;
                stripeClientSecret = clientSecret;
            }
            else // razorpay
            {
                var (rzpOrderId, _) = await _paymentService.CreateRazorpayOrderAsync(finalAmount, orderNumber);
                gatewayOrderId = rzpOrderId;
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = $"Payment gateway error: {ex.Message}" });
        }

        var order = new Order
        {
            OrderNumber = orderNumber,
            UserId = userId,
            TemplateId = dto.TemplateId,
            Amount = price,
            DiscountAmount = discountAmount,
            CouponId = couponId,
            CouponCode = couponCode,
            FinalAmount = finalAmount,
            Status = "Pending",
            PaymentGateway = dto.PaymentGateway,
            GatewayOrderId = gatewayOrderId
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                orderId = order.Id,
                orderNumber = order.OrderNumber,
                amount = order.Amount,
                discountAmount = order.DiscountAmount,
                finalAmount = order.FinalAmount,
                currency = order.Currency,
                gateway = order.PaymentGateway,
                gatewayOrderId = gatewayOrderId,
                razorpayKeyId = dto.PaymentGateway == "razorpay" ? _razorpaySettings.KeyId : null,
                stripeClientSecret = stripeClientSecret
            }
        });
    }

    [HttpPost("verify-razorpay")]
    public async Task<IActionResult> VerifyRazorpay([FromBody] VerifyRazorpayDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, error = "User not authenticated" });

        var order = await _context.Orders.FindAsync(dto.OrderId);
        if (order == null)
            return NotFound(new { success = false, error = "Order not found" });

        if (order.UserId != userId)
            return Forbid();

        // Already verified
        if (order.Status == "Success")
            return Ok(new { success = true, data = new { orderId = order.Id, orderNumber = order.OrderNumber, status = "Success", message = "Payment already verified" } });

        if (order.Status != "Pending")
            return BadRequest(new { success = false, error = $"Order status is {order.Status}, cannot verify" });

        // Verify signature
        var isValid = _paymentService.VerifyRazorpaySignature(dto.RazorpayOrderId, dto.RazorpayPaymentId, dto.RazorpaySignature);
        if (!isValid)
        {
            order.Status = "Failed";
            await _context.SaveChangesAsync();
            return BadRequest(new { success = false, error = "Payment signature verification failed" });
        }

        // Success - update order and create purchase
        order.Status = "Success";
        order.GatewayPaymentId = dto.RazorpayPaymentId;
        order.GatewaySignature = dto.RazorpaySignature;
        order.PaidAt = DateTime.UtcNow;

        _context.UserPurchases.Add(new UserPurchase
        {
            UserId = userId,
            TemplateId = order.TemplateId,
            Amount = order.FinalAmount
        });

        // Increment coupon usage
        if (order.CouponId.HasValue)
        {
            var coupon = await _context.Coupons.FindAsync(order.CouponId.Value);
            if (coupon != null) coupon.CurrentUses++;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                orderId = order.Id,
                orderNumber = order.OrderNumber,
                status = "Success",
                paymentId = dto.RazorpayPaymentId,
                amount = order.FinalAmount,
                message = "Payment verified successfully"
            }
        });
    }

    [HttpPost("verify-stripe")]
    public async Task<IActionResult> VerifyStripe([FromBody] VerifyStripeDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, error = "User not authenticated" });

        var order = await _context.Orders.FindAsync(dto.OrderId);
        if (order == null)
            return NotFound(new { success = false, error = "Order not found" });

        if (order.UserId != userId)
            return Forbid();

        if (order.Status == "Success")
            return Ok(new { success = true, data = new { orderId = order.Id, orderNumber = order.OrderNumber, status = "Success", message = "Payment already verified" } });

        if (order.Status != "Pending")
            return BadRequest(new { success = false, error = $"Order status is {order.Status}, cannot verify" });

        var isValid = await _paymentService.VerifyStripePaymentAsync(dto.PaymentIntentId);
        if (!isValid)
        {
            order.Status = "Failed";
            await _context.SaveChangesAsync();
            return BadRequest(new { success = false, error = "Stripe payment verification failed" });
        }

        order.Status = "Success";
        order.GatewayPaymentId = dto.PaymentIntentId;
        order.PaidAt = DateTime.UtcNow;

        _context.UserPurchases.Add(new UserPurchase
        {
            UserId = userId,
            TemplateId = order.TemplateId,
            Amount = order.FinalAmount
        });

        if (order.CouponId.HasValue)
        {
            var coupon = await _context.Coupons.FindAsync(order.CouponId.Value);
            if (coupon != null) coupon.CurrentUses++;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                orderId = order.Id,
                orderNumber = order.OrderNumber,
                status = "Success",
                paymentId = dto.PaymentIntentId,
                amount = order.FinalAmount,
                message = "Payment verified successfully"
            }
        });
    }

    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, error = "User not authenticated" });

        var orders = await _context.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.Template)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                id = o.Id,
                orderNumber = o.OrderNumber,
                templateName = o.Template != null ? o.Template.Name : "",
                amount = o.Amount,
                discountAmount = o.DiscountAmount,
                finalAmount = o.FinalAmount,
                currency = o.Currency,
                status = o.Status,
                gateway = o.PaymentGateway,
                paymentId = o.GatewayPaymentId,
                createdAt = o.CreatedAt,
                paidAt = o.PaidAt
            })
            .ToListAsync();

        return Ok(new { success = true, data = orders });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, error = "User not authenticated" });

        var order = await _context.Orders
            .Include(o => o.Template)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order == null)
            return NotFound(new { success = false, error = "Order not found" });

        return Ok(new
        {
            success = true,
            data = new
            {
                id = order.Id,
                orderNumber = order.OrderNumber,
                templateName = order.Template?.Name,
                templateId = order.TemplateId,
                amount = order.Amount,
                discountAmount = order.DiscountAmount,
                couponCode = order.CouponCode,
                finalAmount = order.FinalAmount,
                currency = order.Currency,
                status = order.Status,
                gateway = order.PaymentGateway,
                paymentId = order.GatewayPaymentId,
                createdAt = order.CreatedAt,
                paidAt = order.PaidAt
            }
        });
    }

    private async Task<string> GenerateOrderNumber()
    {
        var random = new Random();
        string orderNumber;
        do
        {
            orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{random.Next(1000, 9999)}";
        } while (await _context.Orders.AnyAsync(o => o.OrderNumber == orderNumber));
        return orderNumber;
    }
}
