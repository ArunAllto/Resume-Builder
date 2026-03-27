using System.ComponentModel.DataAnnotations;

namespace ResumeBuilder.Api.Models.DTOs;

public class CreateCouponDto
{
    [Required]
    public string Code { get; set; } = "";

    [Required]
    public string DiscountType { get; set; } = "percent"; // "percent" or "flat"

    [Required]
    public decimal DiscountValue { get; set; }

    public int MaxUses { get; set; } = 100;
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateCouponDto
{
    public string? Code { get; set; }
    public string? DiscountType { get; set; }
    public decimal? DiscountValue { get; set; }
    public int? MaxUses { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool? IsActive { get; set; }
}

public class ValidateCouponDto
{
    [Required]
    public string Code { get; set; } = "";
}
