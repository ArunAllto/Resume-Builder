using System.ComponentModel.DataAnnotations;

namespace ResumeBuilder.Api.Models.DTOs;

public class CreateTemplateDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [Required]
    public string Category { get; set; } = string.Empty;

    public string Thumbnail { get; set; } = string.Empty;

    public object? LayoutConfig { get; set; }

    public bool IsPublished { get; set; } = false;
}

public class UpdateTemplateDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? Thumbnail { get; set; }
    public object? LayoutConfig { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsPublished { get; set; }
}
