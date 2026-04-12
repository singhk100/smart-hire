using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _service;

    public AuthController(IAuthService service)
    {
        _service = service;
    }

    [HttpPost("register")]
    public IActionResult Register(RegisterDto dto)
    {
        return Ok(_service.Register(dto));
    }

    [HttpPost("login")]
    public IActionResult Login(LoginDto dto)
    {
        var token = _service.Login(dto);

        if (token == null)
            return Unauthorized("Invalid credentials");

        return Ok(new { token });
    }
}