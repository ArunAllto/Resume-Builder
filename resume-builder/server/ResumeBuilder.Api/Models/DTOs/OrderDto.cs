using System.ComponentModel.DataAnnotations;

namespace ResumeBuilder.Api.Models.DTOs;

public class CreateOrderDto
{
    [Required]
    public string TemplateId { get; set; } = "";

    [Required]
    public string PaymentGateway { get; set; } = "razorpay"; // razorpay or stripe

    public string? CouponCode { get; set; }
}

public class VerifyRazorpayDto
{
    [Required]
    public string OrderId { get; set; } = "";

    [Required]
    public string RazorpayPaymentId { get; set; } = "";

    [Required]
    public string RazorpayOrderId { get; set; } = "";

    [Required]
    public string RazorpaySignature { get; set; } = "";
}

public class VerifyStripeDto
{
    [Required]
    public string OrderId { get; set; } = "";

    [Required]
    public string PaymentIntentId { get; set; } = "";
}
