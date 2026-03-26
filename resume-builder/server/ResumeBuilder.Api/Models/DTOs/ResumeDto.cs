using System.ComponentModel.DataAnnotations;

namespace ResumeBuilder.Api.Models.DTOs;

public class CreateResumeDto
{
    [Required]
    public string TemplateId { get; set; } = string.Empty;

    public object? Data { get; set; }

    public string SessionId { get; set; } = string.Empty;

    public string? Title { get; set; }
}

public class DraftListItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string TemplateId { get; set; } = string.Empty;
    public string TemplateName { get; set; } = string.Empty;
    public string TemplateThumbnail { get; set; } = string.Empty;
    public string TemplateCategory { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
