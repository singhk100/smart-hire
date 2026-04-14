using JobPortal.API.DTOs.Users;
using JobPortal.API.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult GetProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var user = _context.Users
            .Where(x => x.Id == Guid.Parse(userId))
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Email,
                x.Role
            })
            .FirstOrDefault();

        return Ok(user);
    }

    [HttpPost("CreateUser")]
    public IActionResult CreateUser([FromBody] CreateUserDto dto)
    {
        if (_context.Users.Any(x => x.Email == dto.Email))
            return BadRequest("User already exists");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Email = dto.Email,
            Password_Hash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = Enum.Parse<UserRole>(dto.Role, true)
        };

        _context.Users.Add(user);
        _context.SaveChanges();

        return Ok(new
        {
            message = "User created successfully",
            user.Id,
            user.Email
        });
    }
}