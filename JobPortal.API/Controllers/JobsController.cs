using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/jobs")]
public class JobsController : ControllerBase
{
    private readonly IJobService _service;

    public JobsController(IJobService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_service.GetAll());
    }

    [Authorize(Roles = "recruiter")]
    [HttpPost]
    public IActionResult Create(CreateJobDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var result = _service.Create(Guid.Parse(userId), dto);

        return Ok(new { message = result });
    }

    [Authorize(Roles = "recruiter")]
    [HttpDelete("{jobId:guid}")]
    public IActionResult Delete(Guid jobId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var result = _service.Delete(Guid.Parse(userId), jobId);
        return Ok(new { message = result });
    }
}