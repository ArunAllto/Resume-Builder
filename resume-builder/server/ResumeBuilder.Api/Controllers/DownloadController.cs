using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeBuilder.Api.Data;
using ResumeBuilder.Api.Models;
using ResumeBuilder.Api.Services;

namespace ResumeBuilder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DownloadController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly PdfService _pdfService;
    private readonly CanvasTemplateService _canvasTemplateService;

    public DownloadController(AppDbContext context, PdfService pdfService, CanvasTemplateService canvasTemplateService)
    {
        _context = context;
        _pdfService = pdfService;
        _canvasTemplateService = canvasTemplateService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> DownloadResume(string id)
    {
        var resume = await _context.Resumes
            .Include(r => r.Template)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (resume == null)
            return NotFound(new { success = false, error = "Resume not found" });

        ResumeData? resumeData;
        try
        {
            resumeData = JsonSerializer.Deserialize<ResumeData>(resume.Data,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch
        {
            return BadRequest(new { success = false, error = "Invalid resume data" });
        }

        if (resumeData == null)
            return BadRequest(new { success = false, error = "Resume data is empty" });

        try
        {
            byte[] pdfBytes;
            var layoutConfig = resume.Template?.LayoutConfig ?? "{}";

            // Check if template uses canvas data
            if (layoutConfig.Contains("canvasData"))
            {
                pdfBytes = _canvasTemplateService.GeneratePdf(layoutConfig, resumeData);
            }
            else
            {
                // Fallback to category-based PDF generation
                var category = resume.Template?.Category ?? "professional";
                pdfBytes = _pdfService.GenerateResumePdf(resumeData, category);
            }

            var fileName = $"{resumeData.PersonalInfo?.FullName ?? "resume"}_{DateTime.UtcNow:yyyyMMdd}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = $"Failed to generate PDF: {ex.Message}" });
        }
    }
}
