using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeBuilder.Api.Data;
using ResumeBuilder.Api.Models;
using ResumeBuilder.Api.Models.DTOs;

namespace ResumeBuilder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResumesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ResumesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateResume([FromBody] CreateResumeDto dto)
    {
        var template = await _context.Templates.FindAsync(dto.TemplateId);
        if (template == null)
            return BadRequest(new { success = false, error = "Template not found" });

        var resume = new Resume
        {
            Id = Guid.NewGuid().ToString(),
            TemplateId = dto.TemplateId,
            Data = dto.Data != null ? JsonSerializer.Serialize(dto.Data) : "{}",
            SessionId = dto.SessionId ?? string.Empty,
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

        if (!string.IsNullOrEmpty(dto.TemplateId))
            resume.TemplateId = dto.TemplateId;

        if (dto.Data != null)
            resume.Data = JsonSerializer.Serialize(dto.Data);

        if (!string.IsNullOrEmpty(dto.SessionId))
            resume.SessionId = dto.SessionId;

        resume.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = resume });
    }
}
