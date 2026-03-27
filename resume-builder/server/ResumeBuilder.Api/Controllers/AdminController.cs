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
        var totalRevenue = await _context.UserPurchases.SumAsync(p => p.Amount);

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
        var templates = await _context.Resumes
            .GroupBy(r => r.TemplateId)
            .Select(g => new
            {
                templateId = g.Key,
                usageCount = g.Count()
            })
            .OrderByDescending(x => x.usageCount)
            .Take(limit)
            .Join(
                _context.Templates,
                r => r.templateId,
                t => t.Id,
                (r, t) => new
                {
                    r.templateId,
                    templateName = t.Name,
                    category = t.Category,
                    r.usageCount
                })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            data = templates
        });
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

        var totalRevenue = await _context.UserPurchases.SumAsync(p => p.Amount);
        var monthlyRevenue = await _context.UserPurchases
            .Where(p => p.PurchaseDate >= monthStart)
            .SumAsync(p => p.Amount);
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
                monthlyRevenue,
                totalPurchases,
                monthlyPurchases
            }
        });
    }

    [HttpGet("analytics/recent-activity")]
    public async Task<IActionResult> GetRecentActivity([FromQuery] int limit = 20)
    {
        var recentUsers = await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .Take(limit)
            .Select(u => new
            {
                type = "user_registered",
                date = u.CreatedAt,
                userName = u.FullName,
                userEmail = u.Email,
                details = "New user registered"
            })
            .ToListAsync();

        var recentResumes = await _context.Resumes
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .Take(limit)
            .Select(r => new
            {
                type = "resume_created",
                date = r.CreatedAt,
                userName = r.User != null ? r.User.FullName : "Anonymous",
                userEmail = r.User != null ? r.User.Email : "",
                details = "Created resume: " + r.Title
            })
            .ToListAsync();

        var recentPurchases = await _context.UserPurchases
            .Include(p => p.User)
            .Include(p => p.Template)
            .OrderByDescending(p => p.PurchaseDate)
            .Take(limit)
            .Select(p => new
            {
                type = "template_purchased",
                date = p.PurchaseDate,
                userName = p.User != null ? p.User.FullName : "Unknown",
                userEmail = p.User != null ? p.User.Email : "",
                details = "Purchased template: " + (p.Template != null ? p.Template.Name : p.TemplateId)
            })
            .ToListAsync();

        var activity = recentUsers
            .Concat(recentResumes)
            .Concat(recentPurchases)
            .OrderByDescending(a => a.date)
            .Take(limit)
            .ToList();

        return Ok(new
        {
            success = true,
            data = activity
        });
    }
}
