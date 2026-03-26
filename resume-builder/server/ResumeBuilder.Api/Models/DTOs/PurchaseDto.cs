using System.ComponentModel.DataAnnotations;

namespace ResumeBuilder.Api.Models.DTOs;

public class CreatePurchaseDto
{
    [Required]
    public string TemplateId { get; set; } = string.Empty;
}
