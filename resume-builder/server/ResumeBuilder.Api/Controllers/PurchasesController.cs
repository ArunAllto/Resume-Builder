using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeBuilder.Api.Data;
using ResumeBuilder.Api.Models;
using ResumeBuilder.Api.Models.DTOs;

namespace ResumeBuilder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "UserOnly")]
public class PurchasesController : ControllerBase
{
    private readonly AppDbContext _context;

    public PurchasesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("check")]
    public async Task<IActionResult> CheckPurchase([FromQuery] string templateId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var purchased = await _context.UserPurchases
            .AnyAsync(p => p.UserId == userId && p.TemplateId == templateId);

        return Ok(new { success = true, data = new { purchased } });
    }

    [HttpPost]
    public async Task<IActionResult> Purchase([FromBody] CreatePurchaseDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var template = await _context.Templates.FindAsync(dto.TemplateId);
        if (template == null)
            return NotFound(new { success = false, error = "Template not found" });

        if (template.IsFree)
            return BadRequest(new { success = false, error = "This template is free" });

        var alreadyPurchased = await _context.UserPurchases
            .AnyAsync(p => p.UserId == userId && p.TemplateId == dto.TemplateId);

        if (alreadyPurchased)
            return BadRequest(new { success = false, error = "Template already purchased" });

        var purchase = new UserPurchase
        {
            UserId = userId!,
            TemplateId = dto.TemplateId,
            Amount = template.OfferPrice ?? template.OriginalPrice ?? 0
        };

        _context.UserPurchases.Add(purchase);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = new { purchaseId = purchase.Id, amount = purchase.Amount } });
    }

    [HttpGet("my-purchases")]
    public async Task<IActionResult> GetMyPurchases()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var purchases = await _context.UserPurchases
            .Where(p => p.UserId == userId)
            .Include(p => p.Template)
            .OrderByDescending(p => p.PurchaseDate)
            .Select(p => new
            {
                p.Id,
                p.TemplateId,
                templateName = p.Template!.Name,
                p.Amount,
                p.PurchaseDate
            })
            .ToListAsync();

        return Ok(new { success = true, data = purchases });
    }
}
