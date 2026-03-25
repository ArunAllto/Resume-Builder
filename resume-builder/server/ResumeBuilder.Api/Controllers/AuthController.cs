using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeBuilder.Api.Data;
using ResumeBuilder.Api.Models.DTOs;
using ResumeBuilder.Api.Services;

namespace ResumeBuilder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AuthService _authService;

    public AuthController(AppDbContext context, AuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _context.AdminUsers
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null || !_authService.ValidatePassword(dto.Password, user.PasswordHash))
        {
            return Unauthorized(new { success = false, error = "Invalid credentials" });
        }

        var token = _authService.GenerateJwtToken(user);

        return Ok(new
        {
            success = true,
            data = new
            {
                token,
                email = user.Email
            }
        });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok(new { success = true, data = new { message = "Logged out successfully" } });
    }
}
