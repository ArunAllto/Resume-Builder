using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeBuilder.Api.Data;
using ResumeBuilder.Api.Models;
using ResumeBuilder.Api.Models.DTOs;

namespace ResumeBuilder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly AppDbContext _context;

    public ContactController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> SubmitContact([FromBody] CreateContactSubmissionDto dto)
    {
        var submission = new ContactSubmission
        {
            Name = dto.Name,
            Email = dto.Email,
            Subject = dto.Subject,
            Message = dto.Message,
            CreatedAt = DateTime.UtcNow
        };

        _context.ContactSubmissions.Add(submission);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = new { message = "Contact form submitted successfully" } });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("submissions")]
    public async Task<IActionResult> GetSubmissions()
    {
        var submissions = await _context.ContactSubmissions
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(new { success = true, data = submissions });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("submissions/{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var submission = await _context.ContactSubmissions.FindAsync(id);
        if (submission == null)
            return NotFound(new { success = false, error = "Submission not found" });

        submission.IsRead = true;
        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = submission });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("submissions/{id}")]
    public async Task<IActionResult> DeleteSubmission(Guid id)
    {
        var submission = await _context.ContactSubmissions.FindAsync(id);
        if (submission == null)
            return NotFound(new { success = false, error = "Submission not found" });

        _context.ContactSubmissions.Remove(submission);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = new { message = "Submission deleted successfully" } });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await _context.ContactSubmissions.CountAsync(c => !c.IsRead);
        return Ok(new { success = true, data = new { count } });
    }
}
