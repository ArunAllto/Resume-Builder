using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeBuilder.Api.Data;
using ResumeBuilder.Api.Models;
using ResumeBuilder.Api.Models.DTOs;

namespace ResumeBuilder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TemplatesController : ControllerBase
{
    private readonly AppDbContext _context;

    public TemplatesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTemplates(
        [FromQuery] bool all = false,
        [FromQuery] bool drafts = false)
    {
        IQueryable<Template> query = _context.Templates;

        if (all)
        {
            // Admin: return all templates (requires auth checked by client)
        }
        else if (drafts)
        {
            // Admin: return only unpublished drafts
            query = query.Where(t => t.IsActive && !t.IsPublished);
        }
        else
        {
            // End users: only active AND published templates
            query = query.Where(t => t.IsActive && t.IsPublished);
        }

        var templates = await query.OrderBy(t => t.CreatedAt).ToListAsync();
        return Ok(new { success = true, data = templates });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTemplate(string id)
    {
        var template = await _context.Templates.FindAsync(id);
        if (template == null)
            return NotFound(new { success = false, error = "Template not found" });

        return Ok(new { success = true, data = template });
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateTemplate([FromBody] CreateTemplateDto dto)
    {
        var template = new Template
        {
            Id = Guid.NewGuid().ToString(),
            Name = dto.Name,
            Description = dto.Description,
            Category = dto.Category,
            Thumbnail = dto.Thumbnail,
            LayoutConfig = dto.LayoutConfig != null
                ? JsonSerializer.Serialize(dto.LayoutConfig)
                : "{}",
            IsActive = true,
            IsPublished = dto.IsPublished,
            CreatedAt = DateTime.UtcNow
        };

        _context.Templates.Add(template);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = template });
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTemplate(string id, [FromBody] UpdateTemplateDto dto)
    {
        var template = await _context.Templates.FindAsync(id);
        if (template == null)
            return NotFound(new { success = false, error = "Template not found" });

        if (dto.Name != null) template.Name = dto.Name;
        if (dto.Description != null) template.Description = dto.Description;
        if (dto.Category != null) template.Category = dto.Category;
        if (dto.Thumbnail != null) template.Thumbnail = dto.Thumbnail;
        if (dto.LayoutConfig != null) template.LayoutConfig = JsonSerializer.Serialize(dto.LayoutConfig);
        if (dto.IsActive.HasValue) template.IsActive = dto.IsActive.Value;
        if (dto.IsPublished.HasValue) template.IsPublished = dto.IsPublished.Value;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = template });
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTemplate(string id)
    {
        var template = await _context.Templates.FindAsync(id);
        if (template == null)
            return NotFound(new { success = false, error = "Template not found" });

        _context.Templates.Remove(template);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = new { message = "Template deleted successfully" } });
    }
}
