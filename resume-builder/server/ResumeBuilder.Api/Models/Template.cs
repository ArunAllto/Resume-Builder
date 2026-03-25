using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ResumeBuilder.Api.Models;

public class Template
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    [Column(TypeName = "nvarchar(max)")]
    public string Thumbnail { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    [Column(TypeName = "nvarchar(max)")]
    public string LayoutConfig { get; set; } = "{}";

    public bool IsActive { get; set; } = true;
    public bool IsPublished { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
