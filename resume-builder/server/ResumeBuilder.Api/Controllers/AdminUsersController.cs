using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeBuilder.Api.Data;

namespace ResumeBuilder.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Policy = "AdminOnly")]
public class AdminUsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminUsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(u =>
                u.FullName.ToLower().Contains(term) ||
                u.Email.ToLower().Contains(term));
        }

        var total = await query.CountAsync();

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                u.Avatar,
                u.IsActive,
                u.CreatedAt,
                resumeCount = _context.Resumes.Count(r => r.UserId == u.Id)
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                users,
                total,
                page,
                pageSize
            }
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound(new { success = false, message = "User not found" });

        var resumeCount = await _context.Resumes.CountAsync(r => r.UserId == id);
        var purchaseCount = await _context.UserPurchases.CountAsync(p => p.UserId == id);
        var draftCount = await _context.Resumes.CountAsync(r => r.UserId == id && r.Status == "draft");

        return Ok(new
        {
            success = true,
            data = new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.Avatar,
                user.IsActive,
                user.CreatedAt,
                resumeCount,
                purchaseCount,
                draftCount
            }
        });
    }

    [HttpPut("{id}/toggle-status")]
    public async Task<IActionResult> ToggleStatus(string id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound(new { success = false, message = "User not found" });

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                user.Id,
                user.IsActive
            }
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound(new { success = false, message = "User not found" });

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "User deleted successfully"
        });
    }
}
