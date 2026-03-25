using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeBuilder.Api.Data;

namespace ResumeBuilder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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

        return Ok(new
        {
            success = true,
            data = new
            {
                totalTemplates,
                activeTemplates,
                totalResumes
            }
        });
    }
}
