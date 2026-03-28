using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ResumeBuilder.Api.Models;

namespace ResumeBuilder.Api.Data;

public static class DbSeeder
{
    public static void SeedData(AppDbContext context)
    {
        context.Database.Migrate();

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

        // Seed sample users
        if (!context.Users.Any() || context.Users.Count() < 5)
        {
            var sampleUsers = new List<User>
            {
                new() { Id = Guid.NewGuid().ToString(), FullName = "Arjun Mehta", FirstName = "Arjun", LastName = "Mehta", Email = "arjun.mehta@gmail.com", Username = "arjun_m", Phone = "+91 98765 43210", PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"), Avatar = "", PlanPurchased = "Pro", IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-30) },
                new() { Id = Guid.NewGuid().ToString(), FullName = "Priya Nair", FirstName = "Priya", LastName = "Nair", Email = "priya.nair@outlook.com", Username = "priya_n", Phone = "+91 87654 32109", PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"), Avatar = "", PlanPurchased = "Free", IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-25) },
                new() { Id = Guid.NewGuid().ToString(), FullName = "Rahul Sharma", FirstName = "Rahul", LastName = "Sharma", Email = "rahul.sharma@yahoo.com", Username = "rahul_s", Phone = "+91 76543 21098", PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"), Avatar = "", PlanPurchased = "Enterprise", IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-22) },
                new() { Id = Guid.NewGuid().ToString(), FullName = "Sneha Reddy", FirstName = "Sneha", LastName = "Reddy", Email = "sneha.reddy@gmail.com", Username = "sneha_r", Phone = "+91 65432 10987", PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"), Avatar = "", PlanPurchased = "Pro", IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-20) },
                new() { Id = Guid.NewGuid().ToString(), FullName = "Vikram Patel", FirstName = "Vikram", LastName = "Patel", Email = "vikram.patel@hotmail.com", Username = "vikram_p", Phone = "+91 54321 09876", PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"), Avatar = "", PlanPurchased = "Free", IsActive = false, CreatedAt = DateTime.UtcNow.AddDays(-18) },
                new() { Id = Guid.NewGuid().ToString(), FullName = "Ananya Gupta", FirstName = "Ananya", LastName = "Gupta", Email = "ananya.gupta@gmail.com", Username = "ananya_g", Phone = "+91 43210 98765", PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"), Avatar = "", PlanPurchased = "Pro", IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-15) },
                new() { Id = Guid.NewGuid().ToString(), FullName = "Karthik Iyer", FirstName = "Karthik", LastName = "Iyer", Email = "karthik.iyer@gmail.com", Username = "karthik_i", Phone = "+91 32109 87654", PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"), Avatar = "", PlanPurchased = "Free", IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-14) },
                new() { Id = Guid.NewGuid().ToString(), FullName = "Divya Joshi", FirstName = "Divya", LastName = "Joshi", Email = "divya.joshi@outlook.com", Username = "divya_j", Phone = "+91 21098 76543", PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"), Avatar = "", PlanPurchased = "Enterprise", IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-12) },
                new() { Id = Guid.NewGuid().ToString(), FullName = "Amit Kumar", FirstName = "Amit", LastName = "Kumar", Email = "amit.kumar@gmail.com", Username = "amit_k", Phone = "+91 10987 65432", PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"), Avatar = "", PlanPurchased = "Free", IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-10) },
                new() { Id = Guid.NewGuid().ToString(), FullName = "Meera Krishnan", FirstName = "Meera", LastName = "Krishnan", Email = "meera.k@gmail.com", Username = "meera_k", Phone = "+91 99887 65432", PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"), Avatar = "", PlanPurchased = "Pro", IsActive = false, CreatedAt = DateTime.UtcNow.AddDays(-8) },
                new() { Id = Guid.NewGuid().ToString(), FullName = "Sanjay Verma", FirstName = "Sanjay", LastName = "Verma", Email = "sanjay.verma@yahoo.com", Username = "sanjay_v", Phone = "+91 88776 54321", PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"), Avatar = "", PlanPurchased = "Free", IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-7) },
                new() { Id = Guid.NewGuid().ToString(), FullName = "Lakshmi Sundaram", FirstName = "Lakshmi", LastName = "Sundaram", Email = "lakshmi.s@gmail.com", Username = "lakshmi_s", Phone = "+91 77665 43210", PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"), Avatar = "", PlanPurchased = "Pro", IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-5) },
                new() { Id = Guid.NewGuid().ToString(), FullName = "Rohan Deshmukh", FirstName = "Rohan", LastName = "Deshmukh", Email = "rohan.d@hotmail.com", Username = "rohan_d", Phone = "+91 66554 32109", PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"), Avatar = "", PlanPurchased = "Enterprise", IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-3) },
                new() { Id = Guid.NewGuid().ToString(), FullName = "Pooja Singh", FirstName = "Pooja", LastName = "Singh", Email = "pooja.singh@gmail.com", Username = "pooja_s", Phone = "+91 55443 21098", PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"), Avatar = "", PlanPurchased = "Free", IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-2) },
                new() { Id = Guid.NewGuid().ToString(), FullName = "Aditya Rao", FirstName = "Aditya", LastName = "Rao", Email = "aditya.rao@outlook.com", Username = "aditya_r", Phone = "+91 44332 10987", PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"), Avatar = "", PlanPurchased = "Pro", IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-1) },
            };
            context.Users.AddRange(sampleUsers);
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
