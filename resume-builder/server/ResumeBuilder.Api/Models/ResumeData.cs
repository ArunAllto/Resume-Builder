namespace ResumeBuilder.Api.Models;

public class ResumeData
{
    public PersonalInfo? PersonalInfo { get; set; }
    public string? Summary { get; set; }
    public List<Experience>? Experience { get; set; }
    public List<Education>? Education { get; set; }
    public List<SkillItem>? Skills { get; set; }
    public List<Project>? Projects { get; set; }
    public List<Certification>? Certifications { get; set; }
    public List<LanguageItem>? Languages { get; set; }
}

public class PersonalInfo
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Location { get; set; }
    public string? LinkedIn { get; set; }
    public string? Website { get; set; }
    public string? Photo { get; set; }
}

public class Experience
{
    public string? Id { get; set; }
    public string? Company { get; set; }
    public string? Position { get; set; }
    public string? Location { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public bool Current { get; set; }
    public string? Description { get; set; }
    public List<string>? Highlights { get; set; }
}

public class Education
{
    public string? Id { get; set; }
    public string? Institution { get; set; }
    public string? Degree { get; set; }
    public string? Field { get; set; }
    public string? Location { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string? Gpa { get; set; }
    public List<string>? Highlights { get; set; }
}

public class SkillItem
{
    public string? Id { get; set; }
    public string? Name { get; set; }
    public string? Category { get; set; }
    public string? Level { get; set; }
}

public class Project
{
    public string? Id { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public List<string>? Technologies { get; set; }
    public string? Url { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
}

public class Certification
{
    public string? Id { get; set; }
    public string? Name { get; set; }
    public string? Issuer { get; set; }
    public string? Date { get; set; }
    public string? Url { get; set; }
}

public class LanguageItem
{
    public string? Id { get; set; }
    public string? Name { get; set; }
    public string? Proficiency { get; set; }
}
