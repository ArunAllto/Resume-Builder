using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeBuilder.Api.Data;

namespace ResumeBuilder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalTemplates = await _context.Templates.CountAsync();
        var activeTemplates = await _context.Templates.CountAsync(t => t.IsActive);
        var totalResumes = await _context.Resumes.CountAsync();
        var totalUsers = await _context.Users.CountAsync();
        var totalRevenue = await _context.UserPurchases.SumAsync(p => (decimal?)p.Amount) ?? 0m;

        return Ok(new
        {
            success = true,
            data = new
            {
                totalTemplates,
                activeTemplates,
                totalResumes,
                totalUsers,
                totalRevenue
            }
        });
    }

    [HttpGet("analytics/resume-trends")]
    public async Task<IActionResult> GetResumeTrends([FromQuery] int days = 30)
    {
        var startDate = DateTime.UtcNow.Date.AddDays(-days);

        var trends = await _context.Resumes
            .Where(r => r.CreatedAt >= startDate)
            .GroupBy(r => r.CreatedAt.Date)
            .Select(g => new
            {
                date = g.Key,
                count = g.Count()
            })
            .OrderBy(x => x.date)
            .ToListAsync();

        // Fill in missing days with zero counts
        var allDays = Enumerable.Range(0, days + 1)
            .Select(i => startDate.AddDays(i))
            .Select(d => new
            {
                date = d.ToString("yyyy-MM-dd"),
                count = trends.FirstOrDefault(t => t.date == d)?.count ?? 0
            })
            .ToList();

        return Ok(new
        {
            success = true,
            data = allDays
        });
    }

    [HttpGet("analytics/popular-templates")]
    public async Task<IActionResult> GetPopularTemplates([FromQuery] int limit = 10)
    {
        var grouped = await _context.Resumes
            .GroupBy(r => r.TemplateId)
            .Select(g => new { templateId = g.Key, usageCount = g.Count() })
            .OrderByDescending(x => x.usageCount)
            .Take(limit)
            .ToListAsync();

        var templateIds = grouped.Select(g => g.templateId).ToList();
        var templates = await _context.Templates
            .Where(t => templateIds.Contains(t.Id))
            .Select(t => new { t.Id, t.Name, t.Category })
            .ToListAsync();

        var result = grouped.Select(g =>
        {
            var t = templates.FirstOrDefault(x => x.Id == g.templateId);
            return new
            {
                templateId = g.templateId,
                name = t?.Name ?? "Unknown",
                category = t?.Category ?? "",
                count = g.usageCount
            };
        }).ToList();

        return Ok(new { success = true, data = result });
    }

    [HttpGet("analytics/user-trends")]
    public async Task<IActionResult> GetUserTrends([FromQuery] int days = 30)
    {
        var startDate = DateTime.UtcNow.Date.AddDays(-days);

        var trends = await _context.Users
            .Where(u => u.CreatedAt >= startDate)
            .GroupBy(u => u.CreatedAt.Date)
            .Select(g => new
            {
                date = g.Key,
                count = g.Count()
            })
            .OrderBy(x => x.date)
            .ToListAsync();

        var allDays = Enumerable.Range(0, days + 1)
            .Select(i => startDate.AddDays(i))
            .Select(d => new
            {
                date = d.ToString("yyyy-MM-dd"),
                count = trends.FirstOrDefault(t => t.date == d)?.count ?? 0
            })
            .ToList();

        return Ok(new
        {
            success = true,
            data = allDays
        });
    }

    [HttpGet("analytics/revenue")]
    public async Task<IActionResult> GetRevenue()
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var totalRevenue = await _context.UserPurchases.SumAsync(p => (decimal?)p.Amount) ?? 0m;
        var monthlyRevenue = await _context.UserPurchases
            .Where(p => p.PurchaseDate >= monthStart)
            .SumAsync(p => (decimal?)p.Amount) ?? 0m;
        var totalPurchases = await _context.UserPurchases.CountAsync();
        var monthlyPurchases = await _context.UserPurchases
            .Where(p => p.PurchaseDate >= monthStart)
            .CountAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                totalRevenue,
                thisMonthRevenue = monthlyRevenue,
                totalPurchases,
                thisMonthPurchases = monthlyPurchases
            }
        });
    }

    [HttpGet("analytics/recent-activity")]
    public async Task<IActionResult> GetRecentActivity([FromQuery] int limit = 20)
    {
        var recentUsers = (await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .Take(limit)
            .Select(u => new { u.FullName, u.CreatedAt })
            .ToListAsync())
            .Select(u => (Type: "signup", Time: u.CreatedAt, Description: $"New user registered: {u.FullName}"));

        var recentResumes = (await _context.Resumes
            .OrderByDescending(r => r.CreatedAt)
            .Take(limit)
            .Select(r => new { r.Title, r.CreatedAt })
            .ToListAsync())
            .Select(r => (Type: "resume", Time: r.CreatedAt, Description: $"Resume created: {r.Title}"));

        var recentPurchases = (await _context.UserPurchases
            .Include(p => p.Template)
            .OrderByDescending(p => p.PurchaseDate)
            .Take(limit)
            .Select(p => new { templateName = p.Template != null ? p.Template.Name : p.TemplateId, p.PurchaseDate })
            .ToListAsync())
            .Select(p => (Type: "purchase", Time: p.PurchaseDate, Description: $"Template purchased: {p.templateName}"));

        var activity = recentUsers
            .Concat(recentResumes)
            .Concat(recentPurchases)
            .OrderByDescending(a => a.Time)
            .Take(limit)
            .Select(a => new { type = a.Type, time = a.Time.ToString("o"), description = a.Description })
            .ToList();

        return Ok(new { success = true, data = activity });
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders(
        [FromQuery] string? status = null,
        [FromQuery] string? gateway = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Orders.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(o => o.Status == status);
        if (!string.IsNullOrWhiteSpace(gateway))
            query = query.Where(o => o.PaymentGateway == gateway);

        var total = await query.CountAsync();
        var successCount = await query.CountAsync(o => o.Status == "Success");
        var pendingCount = await query.CountAsync(o => o.Status == "Pending");
        var failedCount = await query.CountAsync(o => o.Status == "Failed");
        var totalRevenue = await query.Where(o => o.Status == "Success").SumAsync(o => (decimal?)o.FinalAmount) ?? 0m;

        var orders = await query
            .Include(o => o.User)
            .Include(o => o.Template)
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new
            {
                id = o.Id,
                orderNumber = o.OrderNumber,
                userEmail = o.User != null ? o.User.Email : "",
                userName = o.User != null ? o.User.FullName : "",
                templateName = o.Template != null ? o.Template.Name : "",
                amount = o.Amount,
                discountAmount = o.DiscountAmount,
                couponCode = o.CouponCode,
                finalAmount = o.FinalAmount,
                currency = o.Currency,
                status = o.Status,
                gateway = o.PaymentGateway,
                paymentId = o.GatewayPaymentId,
                createdAt = o.CreatedAt,
                paidAt = o.PaidAt
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                orders,
                total,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)total / pageSize),
                successCount,
                pendingCount,
                failedCount,
                totalRevenue
            }
        });
    }
}
