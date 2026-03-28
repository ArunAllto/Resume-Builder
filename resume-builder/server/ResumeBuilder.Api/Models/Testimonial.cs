namespace ResumeBuilder.Api.Models;

public class Testimonial
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = "";
    public string Role { get; set; } = "";
    public string Company { get; set; } = "";
    public string Content { get; set; } = "";
    public int Rating { get; set; } = 5;
    public string AvatarUrl { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
