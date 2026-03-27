namespace ResumeBuilder.Api.Models;

public class Coupon
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = "";
    public string DiscountType { get; set; } = "percent"; // "percent" or "flat"
    public decimal DiscountValue { get; set; }
    public int MaxUses { get; set; } = 100;
    public int CurrentUses { get; set; } = 0;
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
