using System.ComponentModel.DataAnnotations;

namespace ResumeBuilder.Api.Models.DTOs;

public class AiEnhanceDto
{
    [Required]
    public string Text { get; set; } = string.Empty;

    [Required]
    public string Type { get; set; } = string.Empty; // "bullet" or "summary"
}
