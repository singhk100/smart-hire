using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/applications")]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationService _service;

    public ApplicationsController(IApplicationService service)
    {
        _service = service;
    }

    [Authorize]
    [HttpPost("apply")]
    public IActionResult Apply(ApplyJobDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return Ok(_service.Apply(Guid.Parse(userId), dto));
    }

    [Authorize]
    [HttpGet("myapplication")]
    public IActionResult GetMy()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return Ok(_service.GetMyApplications(Guid.Parse(userId)));
    }

    [Authorize(Roles = "recruiter")]
    [HttpPut("status")]
    public IActionResult UpdateStatus(UpdateApplicationStatusDto dto)
    {
        return Ok(_service.UpdateStatus(dto));
    }
}