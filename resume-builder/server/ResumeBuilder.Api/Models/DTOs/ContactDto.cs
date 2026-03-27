using System.ComponentModel.DataAnnotations;

namespace ResumeBuilder.Api.Models.DTOs;

public class CreateContactSubmissionDto
{
    [Required]
    public string Name { get; set; } = "";

    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    public string Subject { get; set; } = "";

    [Required]
    public string Message { get; set; } = "";
}
