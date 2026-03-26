using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ResumeBuilder.Api.Data;
using ResumeBuilder.Api.Models;
using ResumeBuilder.Api.Models.DTOs;

namespace ResumeBuilder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResumesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ResumeSettings _settings;

    public ResumesController(AppDbContext context, IOptions<ResumeSettings> settings)
    {
        _context = context;
        _settings = settings.Value;
    }

    [HttpPost]
    public async Task<IActionResult> CreateResume([FromBody] CreateResumeDto dto)
    {
        var template = await _context.Templates.FindAsync(dto.TemplateId);
        if (template == null)
            return BadRequest(new { success = false, error = "Template not found" });

        // Check if user is authenticated
        string? userId = null;
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var roleClaim = User.FindFirstValue(ClaimTypes.Role);
        if (roleClaim == "User" && !string.IsNullOrEmpty(userIdClaim))
        {
            userId = userIdClaim;

            // Enforce draft limit
            var draftCount = await _context.Resumes.CountAsync(r => r.UserId == userId);
            if (draftCount >= _settings.MaxDrafts)
                return BadRequest(new
                {
                    success = false,
                    error = $"Draft limit reached. You can have a maximum of {_settings.MaxDrafts} drafts. Delete one to create a new resume."
                });
        }

        var resume = new Resume
        {
            Id = Guid.NewGuid().ToString(),
            TemplateId = dto.TemplateId,
            Data = dto.Data != null ? JsonSerializer.Serialize(dto.Data) : "{}",
            SessionId = dto.SessionId ?? string.Empty,
            UserId = userId,
            Title = dto.Title ?? $"Resume - {DateTime.UtcNow:MMM dd, yyyy}",
            Status = "draft",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Resumes.Add(resume);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = resume });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetResume(string id)
    {
        var resume = await _context.Resumes
            .Include(r => r.Template)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (resume == null)
            return NotFound(new { success = false, error = "Resume not found" });

        return Ok(new { success = true, data = resume });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateResume(string id, [FromBody] CreateResumeDto dto)
    {
        var resume = await _context.Resumes.FindAsync(id);
        if (resume == null)
            return NotFound(new { success = false, error = "Resume not found" });

        // Verify ownership if user is authenticated
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var roleClaim = User.FindFirstValue(ClaimTypes.Role);
        if (roleClaim == "User" && !string.IsNullOrEmpty(resume.UserId) && resume.UserId != userIdClaim)
            return Forbid();

        if (!string.IsNullOrEmpty(dto.TemplateId))
            resume.TemplateId = dto.TemplateId;

        if (dto.Data != null)
            resume.Data = JsonSerializer.Serialize(dto.Data);

        if (!string.IsNullOrEmpty(dto.SessionId))
            resume.SessionId = dto.SessionId;

        if (!string.IsNullOrEmpty(dto.Title))
            resume.Title = dto.Title;

        resume.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = resume });
    }

    [HttpGet("my-drafts")]
    [Authorize(Policy = "UserOnly")]
    public async Task<IActionResult> GetMyDrafts()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var drafts = await _context.Resumes
            .Where(r => r.UserId == userId)
            .Include(r => r.Template)
            .OrderByDescending(r => r.UpdatedAt)
            .Select(r => new DraftListItemDto
            {
                Id = r.Id,
                Title = r.Title,
                TemplateId = r.TemplateId,
                TemplateName = r.Template != null ? r.Template.Name : "",
                TemplateThumbnail = r.Template != null ? r.Template.Thumbnail : "",
                TemplateCategory = r.Template != null ? r.Template.Category : "",
                Status = r.Status,
                UpdatedAt = r.UpdatedAt,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(new { success = true, data = drafts, maxDrafts = _settings.MaxDrafts });
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "UserOnly")]
    public async Task<IActionResult> DeleteResume(string id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var resume = await _context.Resumes.FindAsync(id);
        if (resume == null)
            return NotFound(new { success = false, error = "Resume not found" });

        if (resume.UserId != userId)
            return Forbid();

        _context.Resumes.Remove(resume);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = new { message = "Draft deleted" } });
    }
}
