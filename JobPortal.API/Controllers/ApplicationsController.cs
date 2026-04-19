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

        var result = _service.Apply(Guid.Parse(userId), dto);

        return Ok(new { message = result });
    }

    [Authorize]
    [HttpGet("myapplication")]
    public IActionResult GetMy()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return Ok(_service.GetMyApplications(Guid.Parse(userId)));
    }

    [Authorize(Roles = "recruiter")]
    [HttpGet("recruiter")]
    public IActionResult GetForRecruiter()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Ok(_service.GetRecruiterApplications(Guid.Parse(userId)));
    }

    [Authorize(Roles = "recruiter")]
    [HttpGet("recruiter/candidates/{candidateId:guid}")]
    public IActionResult GetCandidateProfile(Guid candidateId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var candidate = _service.GetCandidateProfileForRecruiter(Guid.Parse(userId), candidateId);
        if (candidate == null) return NotFound("Candidate not found");
        return Ok(candidate);
    }

    [Authorize(Roles = "recruiter")]
    [HttpPut("status")]
    public IActionResult UpdateStatus(UpdateApplicationStatusDto dto)
    {
        var result = _service.UpdateStatus(dto);
        return Ok(new { message = result });
    }

    [Authorize]
    [HttpDelete("{applicationId:guid}")]
    public IActionResult DeleteMyApplication(Guid applicationId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Ok(_service.DeleteMyApplication(Guid.Parse(userId), applicationId));
    }
}