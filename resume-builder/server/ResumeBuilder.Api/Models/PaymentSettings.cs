namespace ResumeBuilder.Api.Models;

public class RazorpaySettings
{
    public string KeyId { get; set; } = "";
    public string KeySecret { get; set; } = "";
    public bool UseSandbox { get; set; } = false;
}

public class StripeSettings
{
    public string PublishableKey { get; set; } = "";
    public string SecretKey { get; set; } = "";
    public string WebhookSecret { get; set; } = "";
    public bool UseSandbox { get; set; } = false;
}
