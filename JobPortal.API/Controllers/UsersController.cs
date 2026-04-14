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
}