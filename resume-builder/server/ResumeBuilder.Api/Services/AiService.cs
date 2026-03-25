using ResumeBuilder.Api.Models;

namespace ResumeBuilder.Api.Services;

public class AiService
{
    private static readonly string[] ActionVerbs =
    {
        "Spearheaded", "Orchestrated", "Implemented", "Streamlined", "Optimized",
        "Developed", "Engineered", "Architected", "Transformed", "Accelerated",
        "Delivered", "Championed", "Pioneered", "Revamped", "Consolidated"
    };

    public Task<string> EnhanceBulletPoint(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return Task.FromResult(text);

        var random = new Random();
        var verb = ActionVerbs[random.Next(ActionVerbs.Length)];

        // Clean up the text and add an action verb
        var cleaned = text.Trim().TrimEnd('.');
        // Remove leading weak verbs
        var weakVerbs = new[] { "helped", "worked on", "did", "was responsible for", "assisted with", "managed" };
        var lower = cleaned.ToLower();
        foreach (var wv in weakVerbs)
        {
            if (lower.StartsWith(wv))
            {
                cleaned = cleaned[wv.Length..].TrimStart(' ', ',');
                break;
            }
        }

        // Capitalize first letter after verb
        if (cleaned.Length > 0)
            cleaned = char.ToLower(cleaned[0]) + cleaned[1..];

        var enhanced = $"{verb} {cleaned}, resulting in measurable improvements to team productivity and project outcomes.";

        return Task.FromResult(enhanced);
    }

    public Task<string> GenerateSummary(ResumeData data)
    {
        var name = data.PersonalInfo?.FullName ?? "Professional";
        var experienceCount = data.Experience?.Count ?? 0;
        var skillsList = data.Skills?.Select(s => s.Name).Where(n => n != null).Take(5).ToList() ?? new List<string?>();
        var latestRole = data.Experience?.FirstOrDefault()?.Position ?? "professional";
        var latestCompany = data.Experience?.FirstOrDefault()?.Company;

        var yearsText = experienceCount > 0
            ? $"with {experienceCount}+ years of progressive experience"
            : "with diverse professional experience";

        var skillsText = skillsList.Count > 0
            ? $"Proficient in {string.Join(", ", skillsList)}"
            : "Equipped with a diverse technical skill set";

        var roleText = latestCompany != null
            ? $"Most recently served as {latestRole} at {latestCompany}."
            : $"Experienced {latestRole}.";

        var summary = $"Results-driven {latestRole} {yearsText} in delivering high-impact solutions. " +
                      $"{skillsText}. {roleText} " +
                      "Proven track record of collaborating with cross-functional teams to drive innovation and exceed organizational goals.";

        return Task.FromResult(summary);
    }

    public Task<ResumeData> ParseResumeText(string text)
    {
        var resumeData = new ResumeData
        {
            PersonalInfo = new PersonalInfo(),
            Skills = new List<SkillItem>(),
            Experience = new List<Experience>(),
            Education = new List<Education>()
        };

        var lines = text.Split('\n', StringSplitOptions.RemoveEmptyEntries)
                        .Select(l => l.Trim())
                        .Where(l => !string.IsNullOrWhiteSpace(l))
                        .ToList();

        // Extract email
        foreach (var line in lines)
        {
            var emailMatch = System.Text.RegularExpressions.Regex.Match(line, @"[\w.-]+@[\w.-]+\.\w+");
            if (emailMatch.Success)
            {
                resumeData.PersonalInfo.Email = emailMatch.Value;
                break;
            }
        }

        // Extract phone
        foreach (var line in lines)
        {
            var phoneMatch = System.Text.RegularExpressions.Regex.Match(line, @"[\+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,}");
            if (phoneMatch.Success)
            {
                resumeData.PersonalInfo.Phone = phoneMatch.Value.Trim();
                break;
            }
        }

        // First non-empty line is likely the name
        if (lines.Count > 0)
        {
            var potentialName = lines[0];
            if (!potentialName.Contains('@') && !System.Text.RegularExpressions.Regex.IsMatch(potentialName, @"\d{3}"))
            {
                resumeData.PersonalInfo.FullName = potentialName;
            }
        }

        // Extract skills from common keywords
        var commonSkills = new[]
        {
            "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "React", "Angular",
            "Vue", "Node.js", "Express", ".NET", "SQL", "MongoDB", "PostgreSQL", "MySQL",
            "AWS", "Azure", "Docker", "Kubernetes", "Git", "HTML", "CSS", "Sass",
            "REST", "GraphQL", "Redis", "Linux", "Agile", "Scrum", "CI/CD",
            "TailwindCSS", "Bootstrap", "Flutter", "Swift", "Kotlin", "Go", "Rust", "PHP"
        };

        var textLower = text.ToLower();
        foreach (var skill in commonSkills)
        {
            if (textLower.Contains(skill.ToLower()))
            {
                resumeData.Skills.Add(new SkillItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = skill,
                    Category = "Technical",
                    Level = "Intermediate"
                });
            }
        }

        return Task.FromResult(resumeData);
    }
}
