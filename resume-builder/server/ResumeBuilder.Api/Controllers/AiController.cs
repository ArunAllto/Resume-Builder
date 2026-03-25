using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using ResumeBuilder.Api.Models;
using ResumeBuilder.Api.Models.DTOs;
using ResumeBuilder.Api.Services;

namespace ResumeBuilder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    private readonly AiService _aiService;

    public AiController(AiService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("enhance")]
    public async Task<IActionResult> Enhance([FromBody] AiEnhanceDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Text))
            return BadRequest(new { success = false, error = "Text is required" });

        string result;

        switch (dto.Type?.ToLower())
        {
            case "bullet":
                result = await _aiService.EnhanceBulletPoint(dto.Text);
                break;
            case "summary":
                ResumeData? resumeData = null;
                try
                {
                    resumeData = JsonSerializer.Deserialize<ResumeData>(dto.Text,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                }
                catch
                {
                    // If it's not JSON, treat it as plain text and create minimal resume data
                    resumeData = new ResumeData
                    {
                        PersonalInfo = new PersonalInfo { FullName = "Professional" },
                        Summary = dto.Text
                    };
                }

                result = await _aiService.GenerateSummary(resumeData ?? new ResumeData());
                break;
            default:
                return BadRequest(new { success = false, error = "Type must be 'bullet' or 'summary'" });
        }

        return Ok(new { success = true, data = new { enhanced = result } });
    }
}
