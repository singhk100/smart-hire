using JobPortal.API.DTOs.Auth;
using JobPortal.API.Interfaces;
using JobPortal.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _service;
    private readonly AppDbContext _context;
    private readonly IJwtService _jwtService;

    public AuthController(IAuthService service, AppDbContext context, IJwtService jwtService)
    {
        _service = service;
        _context = context;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public IActionResult Register(RegisterDto dto)
    {
        return Ok(_service.Register(dto));
    }

    [HttpPost("login")]
    public IActionResult Login(LoginDto dto)
    {
        var response = _service.Login(dto);

        if (response == null)
            return Unauthorized("Invalid credentials");

        return Ok(response);
    }

    [HttpPost("refresh")]
    public IActionResult Refresh([FromBody] RefreshRequestDto dto)
    {
        var refreshToken = _context.RefreshTokens
            .FirstOrDefault(rt => rt.Token == dto.RefreshToken && rt.RevokedAt == null);

        if (refreshToken == null || refreshToken.ExpiresAt < DateTime.UtcNow)
            return Unauthorized(new { message = "Invalid or expired refresh token" });

        var user = _context.Users.FirstOrDefault(u => u.Id == refreshToken.UserId);
        if (user == null)
            return Unauthorized(new { message = "User not found" });

        // generate new access token
        var newAccessToken = _jwtService.GenerateToken(user);

        // optionally rotate refresh token
        var newRefreshToken = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        refreshToken.RevokedAt = DateTime.UtcNow;

        var newToken = new RefreshTokens
        {
            Id = Guid.NewGuid(),
            Token = newRefreshToken,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(newToken);
        _context.SaveChanges();

        return Ok(new
        {
            accessToken = newAccessToken,
            refreshToken = newRefreshToken,
            expiresAt = DateTime.UtcNow.AddMinutes(20)
        });
    }

}