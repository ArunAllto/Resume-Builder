using System.ComponentModel.DataAnnotations;

namespace ResumeBuilder.Api.Models.DTOs;

public class CreateTestimonialDto
{
    [Required]
    public string Name { get; set; } = "";

    public string Role { get; set; } = "";
    public string Company { get; set; } = "";

    [Required]
    public string Content { get; set; } = "";

    public int Rating { get; set; } = 5;
    public string AvatarUrl { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; } = 0;
}

public class UpdateTestimonialDto
{
    public string? Name { get; set; }
    public string? Role { get; set; }
    public string? Company { get; set; }
    public string? Content { get; set; }
    public int? Rating { get; set; }
    public string? AvatarUrl { get; set; }
    public bool? IsActive { get; set; }
    public int? SortOrder { get; set; }
}
