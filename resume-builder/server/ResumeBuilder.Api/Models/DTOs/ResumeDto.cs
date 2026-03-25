using System.ComponentModel.DataAnnotations;

namespace ResumeBuilder.Api.Models.DTOs;

public class CreateResumeDto
{
    [Required]
    public string TemplateId { get; set; } = string.Empty;

    public object? Data { get; set; }

    public string SessionId { get; set; } = string.Empty;
}
