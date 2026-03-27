using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ResumeBuilder.Api.Models;

namespace ResumeBuilder.Api.Data;

public static class DbSeeder
{
    public static void SeedData(AppDbContext context)
    {
        context.Database.EnsureCreated();

        // Ensure IsPublished column exists (safe ALTER for existing databases)
        try
        {
            context.Database.ExecuteSqlRaw(
                @"IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Templates') AND name = 'IsPublished')
                  ALTER TABLE Templates ADD IsPublished BIT NOT NULL DEFAULT 1");
        }
        catch
        {
            // Column already exists or table not yet created — ignore
        }

        if (!context.AdminUsers.Any())
        {
            context.AdminUsers.Add(new AdminUser
            {
                Email = "admin@resumebuilder.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                CreatedAt = DateTime.UtcNow
            });
            context.SaveChanges();
        }

        if (!context.Templates.Any())
        {
            var templates = new List<Template>
            {
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Professional Classic",
                    Description = "A timeless professional template with a clean single-column layout. Ideal for corporate and business roles.",
                    Category = "professional",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#1a365d",
                        secondaryColor = "#2d3748",
                        fontFamily = "Georgia, serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "single-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = (decimal)50.00,
                    OfferPrice = (decimal)50.00,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Modern Sleek",
                    Description = "A modern and sleek template with contemporary styling. Perfect for tech and creative professionals.",
                    Category = "modern",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#6366f1",
                        secondaryColor = "#4f46e5",
                        fontFamily = "Helvetica, Arial, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "skills", "education", "projects", "certifications", "languages" },
                        showPhoto = true,
                        layout = "single-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = (decimal)50.00,
                    OfferPrice = (decimal)50.00,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Minimal Clean",
                    Description = "A minimalist template that lets your content speak for itself. Great for any industry.",
                    Category = "minimal",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#111827",
                        secondaryColor = "#6b7280",
                        fontFamily = "Arial, sans-serif",
                        fontSize = 10,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "single-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = (decimal)50.00,
                    OfferPrice = (decimal)50.00,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Creative Bold",
                    Description = "A bold and creative two-column template. Perfect for designers, artists, and creative professionals.",
                    Category = "creative",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#dc2626",
                        secondaryColor = "#991b1b",
                        fontFamily = "Verdana, sans-serif",
                        fontSize = 10,
                        sectionOrder = new[] { "summary", "experience", "skills", "education", "projects", "certifications", "languages" },
                        showPhoto = true,
                        layout = "two-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = (decimal)50.00,
                    OfferPrice = (decimal)50.00,
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.Templates.AddRange(templates);
            context.SaveChanges();
        }

        // Seed default SiteSettings (singleton)
        if (!context.SiteSettings.Any())
        {
            context.SiteSettings.Add(new SiteSettings
            {
                Id = 1,
                SiteName = "ResumeAI",
                Tagline = "Build Professional Resumes with AI",
                HeroTitle = "Build Your Perfect Resume with AI",
                HeroSubtitle = "Create professional, ATS-friendly resumes in minutes",
                PrimaryColor = "#4f46e5",
                ContactEmail = "support@resumeai.com",
                ContactPhone = "+91 1234 567 890",
                FooterText = "© 2026 ResumeAI. All rights reserved.",
                SocialLinks = "{}",
            });
            context.SaveChanges();
        }

        // Seed sample testimonials
        if (!context.Testimonials.Any())
        {
            var testimonials = new List<Testimonial>
            {
                new()
                {
                    Name = "Priya Sharma",
                    Role = "Software Engineer",
                    Company = "Infosys",
                    Content = "ResumeAI helped me land my dream job! The AI suggestions were incredibly accurate and the templates are stunning.",
                    Rating = 5,
                    IsActive = true,
                    SortOrder = 1,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Name = "Rahul Patel",
                    Role = "Marketing Manager",
                    Company = "Flipkart",
                    Content = "I was able to create a professional resume in under 10 minutes. The ATS-friendly format got me more interview calls than ever before.",
                    Rating = 5,
                    IsActive = true,
                    SortOrder = 2,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Name = "Ananya Gupta",
                    Role = "Data Analyst",
                    Company = "TCS",
                    Content = "The variety of templates and the ease of customization make ResumeAI stand out from every other resume builder I have tried.",
                    Rating = 4,
                    IsActive = true,
                    SortOrder = 3,
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.Testimonials.AddRange(testimonials);
            context.SaveChanges();
        }
    }
}
