using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ResumeBuilder.Api.Models;

public class Resume
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string TemplateId { get; set; } = string.Empty;

    [Column(TypeName = "nvarchar(max)")]
    public string Data { get; set; } = "{}";

    public string SessionId { get; set; } = string.Empty;

    public string? UserId { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "draft";

    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(TemplateId))]
    public Template? Template { get; set; }

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }
}
