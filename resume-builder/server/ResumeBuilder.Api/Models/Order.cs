using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ResumeBuilder.Api.Models;

public class Order
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string OrderNumber { get; set; } = "";
    public string UserId { get; set; } = "";
    public string TemplateId { get; set; } = "";

    [Column(TypeName = "decimal(10,2)")]
    public decimal Amount { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal DiscountAmount { get; set; }

    public Guid? CouponId { get; set; }
    public string? CouponCode { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal FinalAmount { get; set; }

    public string Currency { get; set; } = "INR";
    public string Status { get; set; } = "Pending"; // Pending, Success, Failed, Refunded
    public string PaymentGateway { get; set; } = "razorpay"; // razorpay, stripe
    public string? GatewayOrderId { get; set; }
    public string? GatewayPaymentId { get; set; }
    public string? GatewaySignature { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    [ForeignKey(nameof(TemplateId))]
    public Template? Template { get; set; }

    [ForeignKey(nameof(CouponId))]
    public Coupon? Coupon { get; set; }
}
