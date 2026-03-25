using Microsoft.AspNetCore.Mvc;
using ResumeBuilder.Api.Services;

namespace ResumeBuilder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly ResumeParserService _parserService;
    private readonly AiService _aiService;

    public UploadController(ResumeParserService parserService, AiService aiService)
    {
        _parserService = parserService;
        _aiService = aiService;
    }

    [HttpPost]
    public async Task<IActionResult> UploadResume(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { success = false, error = "No file uploaded" });

        if (!file.ContentType.Contains("pdf", StringComparison.OrdinalIgnoreCase) &&
            !file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { success = false, error = "Only PDF files are supported" });
        }

        try
        {
            using var stream = file.OpenReadStream();
            var text = await _parserService.ParsePdf(stream);
            var resumeData = await _aiService.ParseResumeText(text);

            return Ok(new { success = true, data = resumeData });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = $"Failed to parse PDF: {ex.Message}" });
        }
    }
}
