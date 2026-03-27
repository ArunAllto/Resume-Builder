using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeBuilder.Api.Data;
using ResumeBuilder.Api.Models;
using ResumeBuilder.Api.Models.DTOs;

namespace ResumeBuilder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SettingsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _context.SiteSettings.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = new SiteSettings();
            _context.SiteSettings.Add(settings);
            await _context.SaveChangesAsync();
        }

        return Ok(new { success = true, data = settings });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPut]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateSiteSettingsDto dto)
    {
        var settings = await _context.SiteSettings.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = new SiteSettings();
            _context.SiteSettings.Add(settings);
            await _context.SaveChangesAsync();
        }

        if (dto.SiteName != null) settings.SiteName = dto.SiteName;
        if (dto.Tagline != null) settings.Tagline = dto.Tagline;
        if (dto.HeroTitle != null) settings.HeroTitle = dto.HeroTitle;
        if (dto.HeroSubtitle != null) settings.HeroSubtitle = dto.HeroSubtitle;
        if (dto.PrimaryColor != null) settings.PrimaryColor = dto.PrimaryColor;
        if (dto.LogoUrl != null) settings.LogoUrl = dto.LogoUrl;
        if (dto.ContactEmail != null) settings.ContactEmail = dto.ContactEmail;
        if (dto.ContactPhone != null) settings.ContactPhone = dto.ContactPhone;
        if (dto.Address != null) settings.Address = dto.Address;
        if (dto.SocialLinks != null) settings.SocialLinks = dto.SocialLinks;
        if (dto.FooterText != null) settings.FooterText = dto.FooterText;
        if (dto.AnnouncementText != null) settings.AnnouncementText = dto.AnnouncementText;
        if (dto.AnnouncementEnabled.HasValue) settings.AnnouncementEnabled = dto.AnnouncementEnabled.Value;
        if (dto.AnnouncementColor != null) settings.AnnouncementColor = dto.AnnouncementColor;
        if (dto.AnnouncementLink != null) settings.AnnouncementLink = dto.AnnouncementLink;
        if (dto.AnnouncementDismissible.HasValue) settings.AnnouncementDismissible = dto.AnnouncementDismissible.Value;
        if (dto.MaintenanceMode.HasValue) settings.MaintenanceMode = dto.MaintenanceMode.Value;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = settings });
    }
}
