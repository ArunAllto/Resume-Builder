namespace ResumeBuilder.Api.Models;

public class ContactSubmission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Subject { get; set; } = "";
    public string Message { get; set; } = "";
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
