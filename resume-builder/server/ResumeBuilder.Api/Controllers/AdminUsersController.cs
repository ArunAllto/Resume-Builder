using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeBuilder.Api.Data;
using ResumeBuilder.Api.Models;

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
        [FromQuery] string? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(u =>
                u.FullName.ToLower().Contains(term) ||
                u.Email.ToLower().Contains(term) ||
                u.Username.ToLower().Contains(term) ||
                u.Phone.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (status.ToLower() == "active")
                query = query.Where(u => u.IsActive);
            else if (status.ToLower() == "inactive")
                query = query.Where(u => !u.IsActive);
        }

        var total = await query.CountAsync();
        var activeCount = await query.CountAsync(u => u.IsActive);
        var inactiveCount = total - activeCount;
        var totalPages = (int)Math.Ceiling((double)total / pageSize);

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                id = u.Id,
                firstName = u.FirstName,
                lastName = u.LastName,
                fullName = u.FullName,
                email = u.Email,
                username = u.Username,
                phone = u.Phone,
                avatar = u.Avatar,
                planPurchased = u.PlanPurchased,
                isActive = u.IsActive,
                createdAt = u.CreatedAt,
                resumeCount = _context.Resumes.Count(r => r.UserId == u.Id),
                purchaseCount = _context.UserPurchases.Count(p => p.UserId == u.Id)
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
                pageSize,
                totalPages,
                activeCount,
                inactiveCount
            }
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound(new { success = false, error = "User not found" });

        var resumeCount = await _context.Resumes.CountAsync(r => r.UserId == id);
        var purchaseCount = await _context.UserPurchases.CountAsync(p => p.UserId == id);
        var draftCount = await _context.Resumes.CountAsync(r => r.UserId == id && r.Status == "draft");

        return Ok(new
        {
            success = true,
            data = new
            {
                id = user.Id,
                firstName = user.FirstName,
                lastName = user.LastName,
                fullName = user.FullName,
                email = user.Email,
                username = user.Username,
                phone = user.Phone,
                avatar = user.Avatar,
                planPurchased = user.PlanPurchased,
                isActive = user.IsActive,
                createdAt = user.CreatedAt,
                resumeCount,
                purchaseCount,
                draftCount
            }
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FirstName) && string.IsNullOrWhiteSpace(dto.FullName))
            return BadRequest(new { success = false, error = "First name or full name is required" });

        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { success = false, error = "Email is required" });

        var exists = await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower());
        if (exists)
            return Conflict(new { success = false, error = "A user with this email already exists" });

        var firstName = dto.FirstName?.Trim() ?? "";
        var lastName = dto.LastName?.Trim() ?? "";
        var fullName = !string.IsNullOrWhiteSpace(dto.FullName)
            ? dto.FullName.Trim()
            : (firstName + " " + lastName).Trim();

        var user = new User
        {
            Id = Guid.NewGuid().ToString(),
            FullName = fullName,
            FirstName = firstName,
            LastName = lastName,
            Email = dto.Email.Trim().ToLower(),
            Username = dto.Username?.Trim() ?? "",
            Phone = dto.Phone?.Trim() ?? "",
            Avatar = dto.Avatar?.Trim(),
            PlanPurchased = dto.PlanPurchased ?? "Free",
            IsActive = dto.IsActive,
            PasswordHash = !string.IsNullOrEmpty(dto.Password)
                ? BCrypt.Net.BCrypt.HashPassword(dto.Password)
                : BCrypt.Net.BCrypt.HashPassword("user123"),
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                id = user.Id,
                firstName = user.FirstName,
                lastName = user.LastName,
                fullName = user.FullName,
                email = user.Email,
                username = user.Username,
                phone = user.Phone,
                avatar = user.Avatar,
                planPurchased = user.PlanPurchased,
                isActive = user.IsActive,
                createdAt = user.CreatedAt
            }
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { success = false, error = "User not found" });

        if (dto.FirstName != null) user.FirstName = dto.FirstName.Trim();
        if (dto.LastName != null) user.LastName = dto.LastName.Trim();
        if (dto.FullName != null) user.FullName = dto.FullName.Trim();
        if (dto.Username != null) user.Username = dto.Username.Trim();
        if (dto.Phone != null) user.Phone = dto.Phone.Trim();
        if (dto.Avatar != null) user.Avatar = dto.Avatar.Trim();
        if (dto.PlanPurchased != null) user.PlanPurchased = dto.PlanPurchased.Trim();
        if (dto.IsActive.HasValue) user.IsActive = dto.IsActive.Value;

        // Auto-update FullName if first/last name changed
        if (dto.FirstName != null || dto.LastName != null)
        {
            user.FullName = (user.FirstName + " " + user.LastName).Trim();
        }

        if (!string.IsNullOrEmpty(dto.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                id = user.Id,
                firstName = user.FirstName,
                lastName = user.LastName,
                fullName = user.FullName,
                email = user.Email,
                username = user.Username,
                phone = user.Phone,
                avatar = user.Avatar,
                planPurchased = user.PlanPurchased,
                isActive = user.IsActive
            }
        });
    }

    [HttpPut("{id}/toggle-status")]
    public async Task<IActionResult> ToggleStatus(string id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound(new { success = false, error = "User not found" });

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                id = user.Id,
                isActive = user.IsActive
            }
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound(new { success = false, error = "User not found" });

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "User deleted successfully"
        });
    }
}

public class CreateUserDto
{
    public string FullName { get; set; } = "";
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Username { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Password { get; set; } = "";
    public string Avatar { get; set; } = "";
    public string PlanPurchased { get; set; } = "Free";
    public bool IsActive { get; set; } = true;
}

public class UpdateUserDto
{
    public string? FullName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Username { get; set; }
    public string? Phone { get; set; }
    public string? Password { get; set; }
    public string? Avatar { get; set; }
    public string? PlanPurchased { get; set; }
    public bool? IsActive { get; set; }
}
