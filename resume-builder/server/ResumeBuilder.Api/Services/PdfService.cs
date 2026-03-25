using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ResumeBuilder.Api.Models;

namespace ResumeBuilder.Api.Services;

public class PdfService
{
    public byte[] GenerateResumePdf(ResumeData data, string templateCategory)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var primaryColor = templateCategory switch
        {
            "professional" => "#1a365d",
            "modern" => "#6366f1",
            "minimal" => "#111827",
            "creative" => "#dc2626",
            _ => "#1a365d"
        };

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.MarginTop(30);
                page.MarginBottom(30);
                page.MarginLeft(40);
                page.MarginRight(40);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken4));

                page.Header().Column(col =>
                {
                    col.Item().Text(data.PersonalInfo?.FullName ?? "Your Name")
                        .FontSize(24).Bold().FontColor(primaryColor);

                    var contactParts = new List<string>();
                    if (!string.IsNullOrEmpty(data.PersonalInfo?.Email))
                        contactParts.Add(data.PersonalInfo.Email);
                    if (!string.IsNullOrEmpty(data.PersonalInfo?.Phone))
                        contactParts.Add(data.PersonalInfo.Phone);
                    if (!string.IsNullOrEmpty(data.PersonalInfo?.Location))
                        contactParts.Add(data.PersonalInfo.Location);
                    if (!string.IsNullOrEmpty(data.PersonalInfo?.LinkedIn))
                        contactParts.Add(data.PersonalInfo.LinkedIn);
                    if (!string.IsNullOrEmpty(data.PersonalInfo?.Website))
                        contactParts.Add(data.PersonalInfo.Website);

                    if (contactParts.Count > 0)
                    {
                        col.Item().Text(string.Join("  |  ", contactParts))
                            .FontSize(9).FontColor(Colors.Grey.Darken2);
                    }

                    col.Item().PaddingTop(5).LineHorizontal(1).LineColor(primaryColor);
                });

                page.Content().PaddingTop(10).Column(col =>
                {
                    // Summary
                    if (!string.IsNullOrEmpty(data.Summary))
                    {
                        col.Item().PaddingBottom(8).Column(section =>
                        {
                            section.Item().Text("PROFESSIONAL SUMMARY")
                                .FontSize(12).Bold().FontColor(primaryColor);
                            section.Item().PaddingTop(4).Text(data.Summary)
                                .FontSize(10).LineHeight(1.3f);
                        });
                    }

                    // Experience
                    if (data.Experience?.Count > 0)
                    {
                        col.Item().PaddingBottom(8).Column(section =>
                        {
                            section.Item().Text("EXPERIENCE")
                                .FontSize(12).Bold().FontColor(primaryColor);

                            foreach (var exp in data.Experience)
                            {
                                section.Item().PaddingTop(6).Column(entry =>
                                {
                                    entry.Item().Row(r =>
                                    {
                                        r.RelativeItem().Text($"{exp.Position ?? "Position"}")
                                            .FontSize(11).Bold();
                                        var dateRange = exp.Current == true
                                            ? $"{exp.StartDate} - Present"
                                            : $"{exp.StartDate} - {exp.EndDate}";
                                        r.AutoItem().Text(dateRange)
                                            .FontSize(9).FontColor(Colors.Grey.Darken1);
                                    });
                                    entry.Item().Text($"{exp.Company ?? ""}{(string.IsNullOrEmpty(exp.Location) ? "" : $", {exp.Location}")}")
                                        .FontSize(10).FontColor(Colors.Grey.Darken2);

                                    if (!string.IsNullOrEmpty(exp.Description))
                                    {
                                        entry.Item().PaddingTop(2).Text(exp.Description)
                                            .FontSize(9).LineHeight(1.2f);
                                    }

                                    if (exp.Highlights?.Count > 0)
                                    {
                                        foreach (var highlight in exp.Highlights)
                                        {
                                            entry.Item().PaddingLeft(10).Row(hr =>
                                            {
                                                hr.AutoItem().Text("- ").FontSize(9);
                                                hr.RelativeItem().Text(highlight).FontSize(9).LineHeight(1.2f);
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }

                    // Education
                    if (data.Education?.Count > 0)
                    {
                        col.Item().PaddingBottom(8).Column(section =>
                        {
                            section.Item().Text("EDUCATION")
                                .FontSize(12).Bold().FontColor(primaryColor);

                            foreach (var edu in data.Education)
                            {
                                section.Item().PaddingTop(4).Column(entry =>
                                {
                                    entry.Item().Row(r =>
                                    {
                                        r.RelativeItem().Text($"{edu.Degree ?? ""} in {edu.Field ?? ""}")
                                            .FontSize(11).Bold();
                                        r.AutoItem().Text($"{edu.StartDate} - {edu.EndDate}")
                                            .FontSize(9).FontColor(Colors.Grey.Darken1);
                                    });
                                    entry.Item().Text($"{edu.Institution ?? ""}{(string.IsNullOrEmpty(edu.Location) ? "" : $", {edu.Location}")}")
                                        .FontSize(10).FontColor(Colors.Grey.Darken2);

                                    if (!string.IsNullOrEmpty(edu.Gpa))
                                    {
                                        entry.Item().Text($"GPA: {edu.Gpa}")
                                            .FontSize(9).FontColor(Colors.Grey.Darken2);
                                    }
                                });
                            }
                        });
                    }

                    // Skills
                    if (data.Skills?.Count > 0)
                    {
                        col.Item().PaddingBottom(8).Column(section =>
                        {
                            section.Item().Text("SKILLS")
                                .FontSize(12).Bold().FontColor(primaryColor);

                            var grouped = data.Skills
                                .GroupBy(s => s.Category ?? "General")
                                .ToList();

                            foreach (var group in grouped)
                            {
                                section.Item().PaddingTop(3).Row(r =>
                                {
                                    r.AutoItem().Text($"{group.Key}: ").FontSize(10).Bold();
                                    r.RelativeItem().Text(string.Join(", ", group.Select(s => s.Name)))
                                        .FontSize(10);
                                });
                            }
                        });
                    }

                    // Projects
                    if (data.Projects?.Count > 0)
                    {
                        col.Item().PaddingBottom(8).Column(section =>
                        {
                            section.Item().Text("PROJECTS")
                                .FontSize(12).Bold().FontColor(primaryColor);

                            foreach (var proj in data.Projects)
                            {
                                section.Item().PaddingTop(4).Column(entry =>
                                {
                                    entry.Item().Text(proj.Name ?? "Project")
                                        .FontSize(11).Bold();
                                    if (!string.IsNullOrEmpty(proj.Description))
                                    {
                                        entry.Item().Text(proj.Description)
                                            .FontSize(9).LineHeight(1.2f);
                                    }
                                    if (proj.Technologies?.Count > 0)
                                    {
                                        entry.Item().PaddingTop(2).Text($"Technologies: {string.Join(", ", proj.Technologies)}")
                                            .FontSize(9).FontColor(Colors.Grey.Darken2);
                                    }
                                });
                            }
                        });
                    }

                    // Certifications
                    if (data.Certifications?.Count > 0)
                    {
                        col.Item().PaddingBottom(8).Column(section =>
                        {
                            section.Item().Text("CERTIFICATIONS")
                                .FontSize(12).Bold().FontColor(primaryColor);

                            foreach (var cert in data.Certifications)
                            {
                                section.Item().PaddingTop(3).Row(r =>
                                {
                                    r.RelativeItem().Text($"{cert.Name ?? "Certification"} - {cert.Issuer ?? ""}")
                                        .FontSize(10);
                                    if (!string.IsNullOrEmpty(cert.Date))
                                    {
                                        r.AutoItem().Text(cert.Date)
                                            .FontSize(9).FontColor(Colors.Grey.Darken1);
                                    }
                                });
                            }
                        });
                    }

                    // Languages
                    if (data.Languages?.Count > 0)
                    {
                        col.Item().PaddingBottom(8).Column(section =>
                        {
                            section.Item().Text("LANGUAGES")
                                .FontSize(12).Bold().FontColor(primaryColor);

                            section.Item().PaddingTop(3).Text(
                                string.Join(", ", data.Languages.Select(l => $"{l.Name} ({l.Proficiency})"))
                            ).FontSize(10);
                        });
                    }
                });

                page.Footer().AlignCenter().Text(text =>
                {
                    text.CurrentPageNumber().FontSize(8);
                    text.Span(" / ").FontSize(8);
                    text.TotalPages().FontSize(8);
                });
            });
        });

        return document.GeneratePdf();
    }
}
