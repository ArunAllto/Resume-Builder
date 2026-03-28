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

        // Seed templates — only add names that don't already exist
        {
            var existingNames = context.Templates.Select(t => t.Name).ToHashSet();
            var allTemplates = new List<Template>
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
                },
                // ── Professional Templates (10) ──────────────────────────────
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Executive Pro",
                    Description = "A polished executive resume with navy tones, ideal for C-suite and senior management roles. Features a photo section and elegant Playfair Display typography.",
                    Category = "professional",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#1e3a5f",
                        secondaryColor = "#4a6fa5",
                        fontFamily = "Playfair Display, serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = true,
                        layout = "single-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Corporate Edge",
                    Description = "A sharp two-column corporate layout with charcoal and blue accents. Built for business analysts, project managers, and corporate leaders.",
                    Category = "professional",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#2c3e50",
                        secondaryColor = "#3498db",
                        fontFamily = "Roboto, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "two-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Traditional Elegance",
                    Description = "A classic warm-toned resume with dark brown and tan hues. Ideal for seasoned professionals who value a refined, traditional presentation.",
                    Category = "professional",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#3e2723",
                        secondaryColor = "#8d6e63",
                        fontFamily = "Georgia, serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "single-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Formal Authority",
                    Description = "A commanding black-and-gold resume exuding authority and prestige. Perfect for directors, VPs, and senior executives.",
                    Category = "professional",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#1a1a2e",
                        secondaryColor = "#c9a84c",
                        fontFamily = "Times New Roman, serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "single-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Banking Professional",
                    Description = "A refined navy-and-silver resume tailored for finance, banking, and investment professionals. Clean lines convey trust and precision.",
                    Category = "professional",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#0d1b2a",
                        secondaryColor = "#778da9",
                        fontFamily = "Lato, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "single-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Legal Brief",
                    Description = "A structured and authoritative resume designed for attorneys, paralegals, and legal professionals. Emphasizes clarity and formality.",
                    Category = "professional",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#2f3640",
                        secondaryColor = "#95a5a6",
                        fontFamily = "Georgia, serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "single-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Consultant Pro",
                    Description = "A modern teal two-column resume built for management consultants and strategy professionals. Includes a photo section for a personal touch.",
                    Category = "professional",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#006d77",
                        secondaryColor = "#83c5be",
                        fontFamily = "Inter, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = true,
                        layout = "two-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Government Standard",
                    Description = "A clean, no-nonsense resume formatted for government and public sector applications. Meets standard compliance expectations.",
                    Category = "professional",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#1b4965",
                        secondaryColor = "#5fa8d3",
                        fontFamily = "Arial, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "single-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Academic Scholar",
                    Description = "A distinguished burgundy sidebar resume placing education front and center. Crafted for researchers, professors, and academic professionals.",
                    Category = "professional",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#800020",
                        secondaryColor = "#c9184a",
                        fontFamily = "Merriweather, serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "education", "experience", "projects", "skills", "certifications", "languages" },
                        showPhoto = true,
                        layout = "sidebar"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Healthcare Pro",
                    Description = "A fresh green-toned resume designed for doctors, nurses, and healthcare workers. Conveys care, professionalism, and reliability.",
                    Category = "professional",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#065f46",
                        secondaryColor = "#6ee7b7",
                        fontFamily = "Source Sans Pro, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = true,
                        layout = "single-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                // ── Modern Templates (10) ─────────────────────────────────────
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Tech Innovator",
                    Description = "A bold indigo-and-violet two-column layout with skills prioritized upfront. Built for tech leads, architects, and engineering managers.",
                    Category = "modern",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#4338ca",
                        secondaryColor = "#7c3aed",
                        fontFamily = "Inter, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "skills", "experience", "projects", "education", "certifications", "languages" },
                        showPhoto = true,
                        layout = "two-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Startup Ready",
                    Description = "A warm coral-and-yellow two-column resume that radiates energy and ambition. Perfect for startup founders and growth-stage professionals.",
                    Category = "modern",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#f97316",
                        secondaryColor = "#fbbf24",
                        fontFamily = "Poppins, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = true,
                        layout = "two-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Digital Native",
                    Description = "A vibrant cyan-and-blue sidebar resume with a photo section. Tailored for digital marketers, social media managers, and content creators.",
                    Category = "modern",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#06b6d4",
                        secondaryColor = "#3b82f6",
                        fontFamily = "Montserrat, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = true,
                        layout = "sidebar"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Developer Focus",
                    Description = "A clean tech-focused layout highlighting skills and projects for software developers. Uses monospace typography for an authentic coder aesthetic.",
                    Category = "modern",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#16a34a",
                        secondaryColor = "#84cc16",
                        fontFamily = "Source Code Pro, monospace",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "skills", "projects", "experience", "education", "certifications", "languages" },
                        showPhoto = false,
                        layout = "two-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "UI/UX Designer",
                    Description = "A stylish pink-and-purple sidebar resume crafted for UI/UX designers. Showcases your creative portfolio with a modern, eye-catching layout.",
                    Category = "modern",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#ec4899",
                        secondaryColor = "#a855f7",
                        fontFamily = "Poppins, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "projects", "skills", "education", "certifications", "languages" },
                        showPhoto = true,
                        layout = "sidebar"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Gradient Flow",
                    Description = "A deep blue-to-sky two-column resume with a smooth, flowing design. Great for product managers, scrum masters, and agile coaches.",
                    Category = "modern",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#1e40af",
                        secondaryColor = "#38bdf8",
                        fontFamily = "Nunito, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = true,
                        layout = "two-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Modern Minimal",
                    Description = "A contemporary single-column resume blending modern aesthetics with minimalist sensibility. Suitable for any professional seeking a clean look.",
                    Category = "modern",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#374151",
                        secondaryColor = "#9ca3af",
                        fontFamily = "Inter, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "single-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Clean Edge",
                    Description = "A slate-and-emerald two-column resume with crisp edges and balanced spacing. Ideal for operations managers and business development roles.",
                    Category = "modern",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#334155",
                        secondaryColor = "#10b981",
                        fontFamily = "Open Sans, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "two-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Fresh Start",
                    Description = "A lively orange-and-yellow sidebar resume perfect for recent graduates and career changers. Energetic design that makes a memorable first impression.",
                    Category = "modern",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#ea580c",
                        secondaryColor = "#facc15",
                        fontFamily = "Lato, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "education", "skills", "projects", "experience", "certifications", "languages" },
                        showPhoto = true,
                        layout = "sidebar"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Metro Style",
                    Description = "A dark two-column resume inspired by metro design language with indigo accents. Perfect for DevOps engineers, cloud architects, and IT professionals.",
                    Category = "modern",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#18181b",
                        secondaryColor = "#6366f1",
                        fontFamily = "Roboto, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "two-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                // ── Minimal Templates (8) ─────────────────────────────────────
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Zen Resume",
                    Description = "A serene, near-black-on-white resume with subtle gray accents. Designed for professionals who value calm simplicity and focused content.",
                    Category = "minimal",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#0f172a",
                        secondaryColor = "#cbd5e1",
                        fontFamily = "Helvetica, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "single-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Swiss Design",
                    Description = "A bold red-and-black resume inspired by the Swiss international typographic style. Clean grid structure with maximum readability.",
                    Category = "minimal",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#dc2626",
                        secondaryColor = "#171717",
                        fontFamily = "Arial, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "single-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Nordic Clean",
                    Description = "A cool slate-blue resume with icy undertones inspired by Scandinavian design. Perfect for those who appreciate understated elegance.",
                    Category = "minimal",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#475569",
                        secondaryColor = "#e2e8f0",
                        fontFamily = "Inter, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "single-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Whitespace",
                    Description = "A minimalist design with generous whitespace, letting your content speak for itself. Timeless Georgia serif typography for a literary feel.",
                    Category = "minimal",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#1f2937",
                        secondaryColor = "#f3f4f6",
                        fontFamily = "Georgia, serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "single-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Simple Lines",
                    Description = "A charcoal-toned resume with clean horizontal separators and zero visual clutter. For professionals who let their achievements do the talking.",
                    Category = "minimal",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#27272a",
                        secondaryColor = "#a1a1aa",
                        fontFamily = "Lato, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "single-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Pure Text",
                    Description = "A stripped-down black-and-gray resume focusing entirely on content. No frills, no distractions — just your qualifications presented with clarity.",
                    Category = "minimal",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#000000",
                        secondaryColor = "#404040",
                        fontFamily = "Times New Roman, serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "single-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Airy Layout",
                    Description = "A light sky-blue two-column resume with an open, breathable layout. Great for entry-level candidates and fresh graduates seeking a modern yet simple look.",
                    Category = "minimal",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#0284c7",
                        secondaryColor = "#bae6fd",
                        fontFamily = "Open Sans, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "two-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Mono Minimal",
                    Description = "A monochrome dark-and-gray resume with restrained typography. Delivers a sleek, professional impression with absolutely no visual noise.",
                    Category = "minimal",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#18181b",
                        secondaryColor = "#71717a",
                        fontFamily = "Source Sans Pro, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "education", "skills", "projects", "certifications", "languages" },
                        showPhoto = false,
                        layout = "single-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                // ── Creative Templates (8) ────────────────────────────────────
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Artistic Flair",
                    Description = "A creative sidebar layout with vibrant purple and pink tones for designers and artists. Showcases your personality alongside your professional story.",
                    Category = "creative",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#7e22ce",
                        secondaryColor = "#f472b6",
                        fontFamily = "Playfair Display, serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "projects", "experience", "skills", "education", "certifications", "languages" },
                        showPhoto = true,
                        layout = "sidebar"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Vibrant Energy",
                    Description = "A high-energy red-and-orange two-column resume that demands attention. Perfect for marketing creatives, event planners, and brand strategists.",
                    Category = "creative",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#ef4444",
                        secondaryColor = "#f97316",
                        fontFamily = "Montserrat, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "projects", "skills", "education", "certifications", "languages" },
                        showPhoto = true,
                        layout = "two-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Neon Accent",
                    Description = "A dark-themed sidebar resume with striking neon green accents. Ideal for game developers, motion designers, and tech-creative professionals.",
                    Category = "creative",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#0f0f0f",
                        secondaryColor = "#39ff14",
                        fontFamily = "Poppins, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "projects", "experience", "skills", "education", "certifications", "languages" },
                        showPhoto = true,
                        layout = "sidebar"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Retro Vibes",
                    Description = "A nostalgic olive-and-mustard two-column resume with vintage charm. Great for writers, photographers, and creatives with a retro aesthetic.",
                    Category = "creative",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#4d7c0f",
                        secondaryColor = "#ca8a04",
                        fontFamily = "Georgia, serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "projects", "skills", "education", "certifications", "languages" },
                        showPhoto = true,
                        layout = "two-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Colorful Cards",
                    Description = "A playful teal-and-coral sidebar resume with a card-based visual style. Perfect for illustrators, animators, and multimedia artists.",
                    Category = "creative",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#0d9488",
                        secondaryColor = "#fb923c",
                        fontFamily = "Nunito, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "projects", "experience", "skills", "education", "certifications", "languages" },
                        showPhoto = true,
                        layout = "sidebar"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Dynamic Resume",
                    Description = "An electric blue-and-magenta two-column resume bursting with dynamic energy. Suited for creative directors, art leads, and brand innovators.",
                    Category = "creative",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#2563eb",
                        secondaryColor = "#d946ef",
                        fontFamily = "Inter, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "projects", "skills", "education", "certifications", "languages" },
                        showPhoto = true,
                        layout = "two-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Portfolio Style",
                    Description = "A dark indigo sidebar resume with gold accents for showcasing creative portfolios. Designed for architects, interior designers, and visual artists.",
                    Category = "creative",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#1e1b4b",
                        secondaryColor = "#eab308",
                        fontFamily = "Montserrat, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "projects", "experience", "skills", "education", "certifications", "languages" },
                        showPhoto = true,
                        layout = "sidebar"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Ocean Breeze",
                    Description = "A deep sea-and-aqua two-column resume evoking coastal freshness. Ideal for travel industry professionals, marine biologists, and environmental creatives.",
                    Category = "creative",
                    Thumbnail = "",
                    LayoutConfig = JsonSerializer.Serialize(new
                    {
                        primaryColor = "#164e63",
                        secondaryColor = "#22d3ee",
                        fontFamily = "Poppins, sans-serif",
                        fontSize = 11,
                        sectionOrder = new[] { "summary", "experience", "projects", "skills", "education", "certifications", "languages" },
                        showPhoto = true,
                        layout = "two-column"
                    }),
                    IsActive = true,
                    IsPublished = true,
                    IsFree = true,
                    OriginalPrice = 0,
                    OfferPrice = 0,
                    CreatedAt = DateTime.UtcNow
                }
            };

            var templates = allTemplates.Where(t => !existingNames.Contains(t.Name)).ToList();
            if (templates.Any())
            {
                context.Templates.AddRange(templates);
                context.SaveChanges();
            }
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
