namespace ResumeBuilder.Api.Models.DTOs;

public class UpdateSiteSettingsDto
{
    public string? SiteName { get; set; }
    public string? Tagline { get; set; }
    public string? HeroTitle { get; set; }
    public string? HeroSubtitle { get; set; }
    public string? PrimaryColor { get; set; }
    public string? LogoUrl { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? Address { get; set; }
    public string? SocialLinks { get; set; }
    public string? FooterText { get; set; }
    public string? AnnouncementText { get; set; }
    public bool? AnnouncementEnabled { get; set; }
    public string? AnnouncementColor { get; set; }
    public string? AnnouncementLink { get; set; }
    public bool? AnnouncementDismissible { get; set; }
    public bool? MaintenanceMode { get; set; }
}
