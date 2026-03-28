using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeBuilder.Api.Data;
using ResumeBuilder.Api.Models;
using ResumeBuilder.Api.Models.DTOs;

namespace ResumeBuilder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CouponsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CouponsController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet]
    public async Task<IActionResult> GetCoupons()
    {
        var coupons = await _context.Coupons
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(new { success = true, data = coupons });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponDto dto)
    {
        var existingCoupon = await _context.Coupons
            .AnyAsync(c => c.Code.ToUpper() == dto.Code.ToUpper());

        if (existingCoupon)
            return BadRequest(new { success = false, error = "A coupon with this code already exists" });

        var coupon = new Coupon
        {
            Code = dto.Code.ToUpper(),
            DiscountType = dto.DiscountType,
            DiscountValue = dto.DiscountValue,
            MaxUses = dto.MaxUses,
            ExpiresAt = dto.ExpiresAt,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = coupon });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCoupon(Guid id, [FromBody] UpdateCouponDto dto)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null)
            return NotFound(new { success = false, error = "Coupon not found" });

        if (dto.Code != null)
        {
            var duplicate = await _context.Coupons
                .AnyAsync(c => c.Code.ToUpper() == dto.Code.ToUpper() && c.Id != id);

            if (duplicate)
                return BadRequest(new { success = false, error = "A coupon with this code already exists" });

            coupon.Code = dto.Code.ToUpper();
        }

        if (dto.DiscountType != null) coupon.DiscountType = dto.DiscountType;
        if (dto.DiscountValue.HasValue) coupon.DiscountValue = dto.DiscountValue.Value;
        if (dto.MaxUses.HasValue) coupon.MaxUses = dto.MaxUses.Value;
        if (dto.ExpiresAt.HasValue) coupon.ExpiresAt = dto.ExpiresAt.Value;
        if (dto.IsActive.HasValue) coupon.IsActive = dto.IsActive.Value;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = coupon });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCoupon(Guid id)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null)
            return NotFound(new { success = false, error = "Coupon not found" });

        _context.Coupons.Remove(coupon);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = new { message = "Coupon deleted successfully" } });
    }

    [HttpPost("validate")]
    public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponDto dto)
    {
        var coupon = await _context.Coupons
            .FirstOrDefaultAsync(c => c.Code.ToUpper() == dto.Code.ToUpper());

        if (coupon == null)
            return NotFound(new { success = false, error = "Invalid coupon code" });

        if (!coupon.IsActive)
            return BadRequest(new { success = false, error = "This coupon is no longer active" });

        if (coupon.ExpiresAt.HasValue && coupon.ExpiresAt.Value < DateTime.UtcNow)
            return BadRequest(new { success = false, error = "This coupon has expired" });

        if (coupon.CurrentUses >= coupon.MaxUses)
            return BadRequest(new { success = false, error = "This coupon has reached its usage limit" });

        return Ok(new
        {
            success = true,
            data = new
            {
                coupon.Code,
                coupon.DiscountType,
                coupon.DiscountValue
            }
        });
    }
}
