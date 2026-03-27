namespace ResumeBuilder.Api.Models;

public class SiteSettings
{
    public int Id { get; set; } = 1; // singleton
    public string SiteName { get; set; } = "ResumeAI";
    public string Tagline { get; set; } = "Build Professional Resumes with AI";
    public string HeroTitle { get; set; } = "Build Your Perfect Resume with AI";
    public string HeroSubtitle { get; set; } = "Create professional, ATS-friendly resumes in minutes";
    public string PrimaryColor { get; set; } = "#4f46e5";
    public string LogoUrl { get; set; } = "";
    public string ContactEmail { get; set; } = "support@resumeai.com";
    public string ContactPhone { get; set; } = "+91 1234 567 890";
    public string Address { get; set; } = "";
    public string SocialLinks { get; set; } = "{}"; // JSON
    public string FooterText { get; set; } = "© 2026 ResumeAI. All rights reserved.";
    public string AnnouncementText { get; set; } = "";
    public bool AnnouncementEnabled { get; set; } = false;
    public string AnnouncementColor { get; set; } = "#4f46e5";
    public string AnnouncementLink { get; set; } = "";
    public bool AnnouncementDismissible { get; set; } = true;
    public bool MaintenanceMode { get; set; } = false;
}
