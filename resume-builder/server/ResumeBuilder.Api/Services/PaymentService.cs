using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using ResumeBuilder.Api.Models;
using Stripe;

namespace ResumeBuilder.Api.Services;

public class PaymentService
{
    private readonly RazorpaySettings _razorpay;
    private readonly StripeSettings _stripe;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly bool _isSandbox;

    public PaymentService(
        IOptions<RazorpaySettings> razorpayOptions,
        IOptions<StripeSettings> stripeOptions,
        IHttpClientFactory httpClientFactory)
    {
        _razorpay = razorpayOptions.Value;
        _stripe = stripeOptions.Value;
        _httpClientFactory = httpClientFactory;
        _isSandbox = _razorpay.UseSandbox || _stripe.UseSandbox
                     || _razorpay.KeyId.Contains("placeholder")
                     || _stripe.SecretKey.Contains("placeholder");
    }

    public bool IsSandbox => _isSandbox;

    // --- Razorpay ---

    public async Task<(string orderId, string receipt)> CreateRazorpayOrderAsync(decimal amountInRupees, string receiptId)
    {
        if (_isSandbox)
        {
            var sandboxId = $"sandbox_order_{Guid.NewGuid().ToString("N")[..12]}";
            return await Task.FromResult((sandboxId, receiptId));
        }

        var client = _httpClientFactory.CreateClient();
        var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_razorpay.KeyId}:{_razorpay.KeySecret}"));
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);

        var amountInPaise = (int)(amountInRupees * 100);
        var payload = new
        {
            amount = amountInPaise,
            currency = "INR",
            receipt = receiptId,
            payment_capture = 1
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PostAsync("https://api.razorpay.com/v1/orders", content);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new Exception($"Razorpay order creation failed: {errorBody}");
        }

        var responseBody = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(responseBody);
        var orderId = doc.RootElement.GetProperty("id").GetString()!;
        return (orderId, receiptId);
    }

    public bool VerifyRazorpaySignature(string razorpayOrderId, string razorpayPaymentId, string razorpaySignature)
    {
        if (_isSandbox) return true;

        var message = $"{razorpayOrderId}|{razorpayPaymentId}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_razorpay.KeySecret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(message));
        var expectedSignature = BitConverter.ToString(hash).Replace("-", "").ToLower();
        return expectedSignature == razorpaySignature;
    }

    // --- Stripe ---

    public async Task<(string paymentIntentId, string clientSecret)> CreateStripePaymentIntentAsync(decimal amountInRupees, string currency = "inr")
    {
        if (_isSandbox)
        {
            var sandboxId = $"sandbox_pi_{Guid.NewGuid().ToString("N")[..12]}";
            var sandboxSecret = $"sandbox_secret_{Guid.NewGuid().ToString("N")[..12]}";
            return await Task.FromResult((sandboxId, sandboxSecret));
        }

        StripeConfiguration.ApiKey = _stripe.SecretKey;
        var service = new PaymentIntentService();
        var amountInPaise = (long)(amountInRupees * 100);

        var options = new PaymentIntentCreateOptions
        {
            Amount = amountInPaise,
            Currency = currency,
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions { Enabled = true },
        };

        var intent = await service.CreateAsync(options);
        return (intent.Id, intent.ClientSecret);
    }

    public async Task<bool> VerifyStripePaymentAsync(string paymentIntentId)
    {
        if (_isSandbox) return await Task.FromResult(true);

        StripeConfiguration.ApiKey = _stripe.SecretKey;
        var service = new PaymentIntentService();
        var intent = await service.GetAsync(paymentIntentId);
        return intent.Status == "succeeded";
    }
}
