using System.Text.Json;
using System.Text.RegularExpressions;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ResumeBuilder.Api.Models;
using SkiaSharp;

namespace ResumeBuilder.Api.Services;

public class CanvasTemplateService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    /// <summary>
    /// Resolves a data binding path (e.g., "personal.fullName") to actual resume data.
    /// </summary>
    public string ResolveBinding(string binding, ResumeData resumeData)
    {
        if (string.IsNullOrEmpty(binding) || resumeData == null)
            return string.Empty;

        var parts = binding.Split('.');
        var section = parts[0].ToLowerInvariant();

        // For single-part bindings like "summary"
        if (parts.Length == 1)
        {
            return section switch
            {
                "summary" => resumeData.Summary ?? string.Empty,
                "experience" => FormatExperienceSection(resumeData.Experience),
                "education" => FormatEducationSection(resumeData.Education),
                "skills" => FormatSkillsSection(resumeData.Skills),
                "projects" => FormatProjectsSection(resumeData.Projects),
                "certifications" => FormatCertificationsSection(resumeData.Certifications),
                "languages" => FormatLanguagesSection(resumeData.Languages),
                _ => string.Empty
            };
        }

        var field = parts[1].ToLowerInvariant();

        return section switch
        {
            "personal" => ResolvePersonalBinding(field, resumeData.PersonalInfo),
            "summary" => resumeData.Summary ?? string.Empty,
            "experience" => FormatExperienceSection(resumeData.Experience),
            "education" => FormatEducationSection(resumeData.Education),
            "skills" => FormatSkillsSection(resumeData.Skills),
            "projects" => FormatProjectsSection(resumeData.Projects),
            "certifications" => FormatCertificationsSection(resumeData.Certifications),
            "languages" => FormatLanguagesSection(resumeData.Languages),
            _ => string.Empty
        };
    }

    /// <summary>
    /// Generates a PDF from canvas template JSON data and resume data using QuestPDF.
    /// </summary>
    public byte[] GeneratePdf(string layoutConfigJson, ResumeData resumeData)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var layoutConfig = JsonSerializer.Deserialize<JsonElement>(layoutConfigJson, JsonOptions);

        // Extract canvas data elements
        var elements = new List<CanvasElement>();
        if (layoutConfig.TryGetProperty("canvasData", out var canvasData) &&
            canvasData.TryGetProperty("elements", out var elementsArray))
        {
            foreach (var elem in elementsArray.EnumerateArray())
            {
                elements.Add(ParseCanvasElement(elem));
            }
        }

        // Extract page settings from canvas data or use defaults
        float pageWidth = 595; // A4 in points
        float pageHeight = 842;
        if (canvasData.ValueKind == JsonValueKind.Object)
        {
            if (canvasData.TryGetProperty("width", out var w))
                pageWidth = w.GetSingle();
            if (canvasData.TryGetProperty("height", out var h))
                pageHeight = h.GetSingle();
        }

        // Sort elements by Y position (top to bottom), then X (left to right)
        elements = elements.OrderBy(e => e.Y).ThenBy(e => e.X).ToList();

        // Resolve all data bindings
        foreach (var element in elements)
        {
            if (!string.IsNullOrEmpty(element.Binding))
            {
                element.ResolvedText = ResolveBinding(element.Binding, resumeData);
            }
            else if (!string.IsNullOrEmpty(element.Text))
            {
                // Resolve inline bindings like {{personal.fullName}}
                element.ResolvedText = ResolveInlineBindings(element.Text, resumeData);
            }
        }

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(pageWidth, pageHeight, Unit.Point);
                page.Margin(0);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken4));

                page.Content().Canvas((skCanvas, size) =>
                {
                    var canvas = (SKCanvas)skCanvas;
                    foreach (var element in elements)
                    {
                        RenderCanvasElement(canvas, element);
                    }
                });
            });
        });

        return document.GeneratePdf();
    }

    private void RenderCanvasElement(SKCanvas canvas, CanvasElement element)
    {
        switch (element.Type?.ToLowerInvariant())
        {
            case "text":
            case "heading":
            case "label":
                RenderTextElement(canvas, element);
                break;

            case "rectangle":
            case "rect":
            case "shape":
                RenderRectangleElement(canvas, element);
                break;

            case "line":
            case "divider":
                RenderLineElement(canvas, element);
                break;

            case "section":
                // Sections are containers - render background if any, then text
                if (!string.IsNullOrEmpty(element.BackgroundColor))
                {
                    using var bgPaint = new SKPaint
                    {
                        Color = ParseColor(element.BackgroundColor),
                        Style = SKPaintStyle.Fill,
                        IsAntialias = true
                    };
                    canvas.DrawRect(element.X, element.Y, element.Width, element.Height, bgPaint);
                }
                RenderTextElement(canvas, element);
                break;
        }
    }

    private static void RenderTextElement(SKCanvas canvas, CanvasElement element)
    {
        var displayText = element.ResolvedText ?? element.Text ?? string.Empty;
        if (string.IsNullOrEmpty(displayText))
            return;

        using var paint = new SKPaint
        {
            Color = ParseColor(element.Color ?? "#000000"),
            TextSize = element.FontSize > 0 ? element.FontSize : 10,
            IsAntialias = true,
            FakeBoldText = element.Bold
        };

        // Render text with basic word wrapping
        var lines = WrapText(displayText, paint, element.Width > 0 ? element.Width : 500);
        var lineHeight = paint.TextSize * 1.3f;
        var y = element.Y + paint.TextSize; // Baseline offset

        foreach (var line in lines)
        {
            canvas.DrawText(line, element.X, y, paint);
            y += lineHeight;
        }
    }

    private static void RenderRectangleElement(SKCanvas canvas, CanvasElement element)
    {
        if (!string.IsNullOrEmpty(element.BackgroundColor))
        {
            using var fillPaint = new SKPaint
            {
                Color = ParseColor(element.BackgroundColor),
                Style = SKPaintStyle.Fill,
                IsAntialias = true
            };
            canvas.DrawRect(element.X, element.Y, element.Width, element.Height, fillPaint);
        }

        if (!string.IsNullOrEmpty(element.BorderColor) && element.BorderWidth > 0)
        {
            using var strokePaint = new SKPaint
            {
                Color = ParseColor(element.BorderColor),
                Style = SKPaintStyle.Stroke,
                StrokeWidth = element.BorderWidth,
                IsAntialias = true
            };
            canvas.DrawRect(element.X, element.Y, element.Width, element.Height, strokePaint);
        }
    }

    private static void RenderLineElement(SKCanvas canvas, CanvasElement element)
    {
        using var paint = new SKPaint
        {
            Color = ParseColor(element.Color ?? "#000000"),
            StrokeWidth = element.BorderWidth > 0 ? element.BorderWidth : 1,
            Style = SKPaintStyle.Stroke,
            IsAntialias = true
        };

        canvas.DrawLine(
            element.X, element.Y,
            element.X + element.Width, element.Y + element.Height,
            paint);
    }

    private static CanvasElement ParseCanvasElement(JsonElement json)
    {
        var element = new CanvasElement();

        if (json.TryGetProperty("type", out var type))
            element.Type = type.GetString();
        if (json.TryGetProperty("x", out var x))
            element.X = x.GetSingle();
        if (json.TryGetProperty("y", out var y))
            element.Y = y.GetSingle();
        if (json.TryGetProperty("width", out var w))
            element.Width = w.GetSingle();
        if (json.TryGetProperty("height", out var h))
            element.Height = h.GetSingle();
        if (json.TryGetProperty("text", out var text))
            element.Text = text.GetString();
        if (json.TryGetProperty("binding", out var binding))
            element.Binding = binding.GetString();
        if (json.TryGetProperty("color", out var color))
            element.Color = color.GetString();
        if (json.TryGetProperty("backgroundColor", out var bg))
            element.BackgroundColor = bg.GetString();
        if (json.TryGetProperty("fontSize", out var fs))
            element.FontSize = fs.GetSingle();
        if (json.TryGetProperty("bold", out var bold))
            element.Bold = bold.GetBoolean();
        if (json.TryGetProperty("borderColor", out var bc))
            element.BorderColor = bc.GetString();
        if (json.TryGetProperty("borderWidth", out var bw))
            element.BorderWidth = bw.GetSingle();

        return element;
    }

    private string ResolveInlineBindings(string text, ResumeData resumeData)
    {
        return Regex.Replace(text, @"\{\{(.+?)\}\}", match =>
        {
            var binding = match.Groups[1].Value.Trim();
            var resolved = ResolveBinding(binding, resumeData);
            return !string.IsNullOrEmpty(resolved) ? resolved : match.Value;
        });
    }

    private static string ResolvePersonalBinding(string field, PersonalInfo? info)
    {
        if (info == null) return string.Empty;

        return field switch
        {
            "fullname" or "name" => info.FullName ?? string.Empty,
            "email" => info.Email ?? string.Empty,
            "phone" => info.Phone ?? string.Empty,
            "location" => info.Location ?? string.Empty,
            "linkedin" => info.LinkedIn ?? string.Empty,
            "website" => info.Website ?? string.Empty,
            _ => string.Empty
        };
    }

    private static string FormatExperienceSection(List<Experience>? experiences)
    {
        if (experiences == null || experiences.Count == 0) return string.Empty;

        var lines = new List<string>();
        foreach (var exp in experiences)
        {
            var dateRange = exp.Current ? $"{exp.StartDate} - Present" : $"{exp.StartDate} - {exp.EndDate}";
            lines.Add($"{exp.Position} at {exp.Company} ({dateRange})");
            if (!string.IsNullOrEmpty(exp.Location))
                lines.Add($"  {exp.Location}");
            if (!string.IsNullOrEmpty(exp.Description))
                lines.Add($"  {exp.Description}");
            if (exp.Highlights?.Count > 0)
            {
                foreach (var h in exp.Highlights)
                    lines.Add($"  - {h}");
            }
            lines.Add(string.Empty);
        }
        return string.Join("\n", lines).TrimEnd();
    }

    private static string FormatEducationSection(List<Education>? education)
    {
        if (education == null || education.Count == 0) return string.Empty;

        var lines = new List<string>();
        foreach (var edu in education)
        {
            lines.Add($"{edu.Degree} in {edu.Field}");
            lines.Add($"{edu.Institution} ({edu.StartDate} - {edu.EndDate})");
            if (!string.IsNullOrEmpty(edu.Gpa))
                lines.Add($"GPA: {edu.Gpa}");
            lines.Add(string.Empty);
        }
        return string.Join("\n", lines).TrimEnd();
    }

    private static string FormatSkillsSection(List<SkillItem>? skills)
    {
        if (skills == null || skills.Count == 0) return string.Empty;

        var grouped = skills.GroupBy(s => s.Category ?? "General");
        var lines = new List<string>();
        foreach (var group in grouped)
        {
            lines.Add($"{group.Key}: {string.Join(", ", group.Select(s => s.Name))}");
        }
        return string.Join("\n", lines);
    }

    private static string FormatProjectsSection(List<Project>? projects)
    {
        if (projects == null || projects.Count == 0) return string.Empty;

        var lines = new List<string>();
        foreach (var proj in projects)
        {
            lines.Add(proj.Name ?? "Project");
            if (!string.IsNullOrEmpty(proj.Description))
                lines.Add($"  {proj.Description}");
            if (proj.Technologies?.Count > 0)
                lines.Add($"  Technologies: {string.Join(", ", proj.Technologies)}");
            lines.Add(string.Empty);
        }
        return string.Join("\n", lines).TrimEnd();
    }

    private static string FormatCertificationsSection(List<Certification>? certifications)
    {
        if (certifications == null || certifications.Count == 0) return string.Empty;

        return string.Join("\n", certifications.Select(c =>
            $"{c.Name} - {c.Issuer}{(!string.IsNullOrEmpty(c.Date) ? $" ({c.Date})" : "")}"));
    }

    private static string FormatLanguagesSection(List<LanguageItem>? languages)
    {
        if (languages == null || languages.Count == 0) return string.Empty;

        return string.Join(", ", languages.Select(l => $"{l.Name} ({l.Proficiency})"));
    }

    private static SKColor ParseColor(string hex)
    {
        if (string.IsNullOrEmpty(hex))
            return SKColor.Parse("#000000");

        try
        {
            return SKColor.Parse(hex);
        }
        catch
        {
            return SKColor.Parse("#000000");
        }
    }

    private static List<string> WrapText(string text, SKPaint paint, float maxWidth)
    {
        var lines = new List<string>();
        if (maxWidth <= 0) maxWidth = 500;

        // Split by explicit newlines first
        var paragraphs = text.Split('\n');

        foreach (var paragraph in paragraphs)
        {
            if (string.IsNullOrEmpty(paragraph))
            {
                lines.Add(string.Empty);
                continue;
            }

            var words = paragraph.Split(' ');
            var currentLine = string.Empty;

            foreach (var word in words)
            {
                var testLine = string.IsNullOrEmpty(currentLine) ? word : $"{currentLine} {word}";
                var measured = paint.MeasureText(testLine);

                if (measured > maxWidth && !string.IsNullOrEmpty(currentLine))
                {
                    lines.Add(currentLine);
                    currentLine = word;
                }
                else
                {
                    currentLine = testLine;
                }
            }

            if (!string.IsNullOrEmpty(currentLine))
                lines.Add(currentLine);
        }

        return lines;
    }
}

/// <summary>
/// Represents a single element from the canvas template designer.
/// </summary>
internal class CanvasElement
{
    public string? Type { get; set; }
    public float X { get; set; }
    public float Y { get; set; }
    public float Width { get; set; }
    public float Height { get; set; }
    public string? Text { get; set; }
    public string? Binding { get; set; }
    public string? Color { get; set; }
    public string? BackgroundColor { get; set; }
    public float FontSize { get; set; }
    public bool Bold { get; set; }
    public string? BorderColor { get; set; }
    public float BorderWidth { get; set; }

    /// <summary>
    /// Text after data binding resolution. Set during PDF generation.
    /// </summary>
    public string? ResolvedText { get; set; }
}
