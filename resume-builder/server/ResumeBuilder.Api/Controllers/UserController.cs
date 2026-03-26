using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeBuilder.Api.Data;
using ResumeBuilder.Api.Models;
using ResumeBuilder.Api.Models.DTOs;
using ResumeBuilder.Api.Services;

namespace ResumeBuilder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AuthService _authService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public UserController(AppDbContext context, AuthService authService,
        IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _context = context;
        _authService = authService;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, error = "Invalid input" });

        var exists = await _context.Users.AnyAsync(u => u.Email == dto.Email.ToLower());
        if (exists)
            return BadRequest(new { success = false, error = "Email already registered" });

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email.ToLower(),
            PasswordHash = _authService.HashPassword(dto.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _authService.GenerateJwtToken(user);

        return Ok(new
        {
            success = true,
            data = new
            {
                token,
                user = new UserProfileDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Avatar = user.Avatar,
                    CreatedAt = user.CreatedAt
                }
            }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, error = "Invalid input" });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());
        if (user == null || !_authService.ValidatePassword(dto.Password, user.PasswordHash))
            return Unauthorized(new { success = false, error = "Invalid email or password" });

        if (!user.IsActive)
            return Unauthorized(new { success = false, error = "Account is deactivated" });

        var token = _authService.GenerateJwtToken(user);

        return Ok(new
        {
            success = true,
            data = new
            {
                token,
                user = new UserProfileDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Avatar = user.Avatar,
                    CreatedAt = user.CreatedAt
                }
            }
        });
    }

    [HttpPost("google-auth")]
    public async Task<IActionResult> GoogleAuth([FromBody] GoogleAuthDto dto)
    {
        try
        {
            // Verify Google ID token
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync(
                $"https://oauth2.googleapis.com/tokeninfo?id_token={dto.IdToken}");

            if (!response.IsSuccessStatusCode)
                return BadRequest(new { success = false, error = "Invalid Google token" });

            var content = await response.Content.ReadAsStringAsync();
            var googleData = JsonSerializer.Deserialize<JsonElement>(content);

            var email = googleData.GetProperty("email").GetString()?.ToLower();
            var name = googleData.TryGetProperty("name", out var n) ? n.GetString() : email;
            var picture = googleData.TryGetProperty("picture", out var p) ? p.GetString() : null;
            var googleId = googleData.GetProperty("sub").GetString();

            if (string.IsNullOrEmpty(email))
                return BadRequest(new { success = false, error = "Could not get email from Google" });

            // Find existing user by GoogleId or Email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId);
            if (user == null)
            {
                user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (user != null)
                {
                    // Link Google account to existing email user
                    user.GoogleId = googleId;
                    if (string.IsNullOrEmpty(user.Avatar)) user.Avatar = picture;
                }
                else
                {
                    // Create new user
                    user = new User
                    {
                        FullName = name ?? email,
                        Email = email,
                        GoogleId = googleId,
                        Avatar = picture,
                        PasswordHash = _authService.HashPassword(Guid.NewGuid().ToString())
                    };
                    _context.Users.Add(user);
                }
                await _context.SaveChangesAsync();
            }

            var token = _authService.GenerateJwtToken(user);

            return Ok(new
            {
                success = true,
                data = new
                {
                    token,
                    user = new UserProfileDto
                    {
                        Id = user.Id,
                        FullName = user.FullName,
                        Email = user.Email,
                        Avatar = user.Avatar,
                        CreatedAt = user.CreatedAt
                    }
                }
            });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Google auth error: {ex.Message}");
            return StatusCode(500, new { success = false, error = "Google authentication failed" });
        }
    }

    [HttpGet("me")]
    [Authorize(Policy = "UserOnly")]
    public async Task<IActionResult> GetMe()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound(new { success = false, error = "User not found" });

        return Ok(new
        {
            success = true,
            data = new UserProfileDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Avatar = user.Avatar,
                CreatedAt = user.CreatedAt
            }
        });
    }
}
