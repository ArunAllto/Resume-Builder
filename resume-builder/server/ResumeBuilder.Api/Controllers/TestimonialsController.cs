using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeBuilder.Api.Data;
using ResumeBuilder.Api.Models;
using ResumeBuilder.Api.Models.DTOs;

namespace ResumeBuilder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestimonialsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TestimonialsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetActiveTestimonials()
    {
        var testimonials = await _context.Testimonials
            .Where(t => t.IsActive)
            .OrderBy(t => t.SortOrder)
            .ToListAsync();

        return Ok(new { success = true, data = testimonials });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("all")]
    public async Task<IActionResult> GetAllTestimonials()
    {
        var testimonials = await _context.Testimonials
            .OrderBy(t => t.SortOrder)
            .ToListAsync();

        return Ok(new { success = true, data = testimonials });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<IActionResult> CreateTestimonial([FromBody] CreateTestimonialDto dto)
    {
        var testimonial = new Testimonial
        {
            Name = dto.Name,
            Role = dto.Role,
            Company = dto.Company,
            Content = dto.Content,
            Rating = dto.Rating,
            AvatarUrl = dto.AvatarUrl,
            IsActive = dto.IsActive,
            SortOrder = dto.SortOrder,
            CreatedAt = DateTime.UtcNow
        };

        _context.Testimonials.Add(testimonial);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = testimonial });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTestimonial(Guid id, [FromBody] UpdateTestimonialDto dto)
    {
        var testimonial = await _context.Testimonials.FindAsync(id);
        if (testimonial == null)
            return NotFound(new { success = false, error = "Testimonial not found" });

        if (dto.Name != null) testimonial.Name = dto.Name;
        if (dto.Role != null) testimonial.Role = dto.Role;
        if (dto.Company != null) testimonial.Company = dto.Company;
        if (dto.Content != null) testimonial.Content = dto.Content;
        if (dto.Rating.HasValue) testimonial.Rating = dto.Rating.Value;
        if (dto.AvatarUrl != null) testimonial.AvatarUrl = dto.AvatarUrl;
        if (dto.IsActive.HasValue) testimonial.IsActive = dto.IsActive.Value;
        if (dto.SortOrder.HasValue) testimonial.SortOrder = dto.SortOrder.Value;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = testimonial });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTestimonial(Guid id)
    {
        var testimonial = await _context.Testimonials.FindAsync(id);
        if (testimonial == null)
            return NotFound(new { success = false, error = "Testimonial not found" });

        _context.Testimonials.Remove(testimonial);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = new { message = "Testimonial deleted successfully" } });
    }
}
