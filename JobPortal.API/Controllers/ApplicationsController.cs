using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/applications")]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationService _service;
    private readonly HttpClient _httpClient;
    private readonly AppDbContext _context;

    public ApplicationsController(IApplicationService service, HttpClient httpClient, AppDbContext context)
    {
        _service = service;
        _httpClient = httpClient;
        _context = context;
    }

    private async Task<int> GetAiScoreAsync(string resumeText, string jobDescription)
    {
        var payload = new { resume_text = resumeText, job_description = jobDescription };
        var response = await _httpClient.PostAsJsonAsync("http://localhost:8000/score_match", payload);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadFromJsonAsync<Dictionary<string, int>>();
        return json["score"];
    }

    [Authorize]
    [HttpPost("apply")]
    public async Task<IActionResult> Apply(ApplyJobDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized("Invalid user token.");

        var userGuid = Guid.Parse(userId);

        var result = await _service.ApplyAsync(userGuid, dto);

        var resume = _context.Resumes.FirstOrDefault(r => r.UserId == userGuid);
        var job = _context.Jobs.FirstOrDefault(j => j.Id == dto.JobId);

        if (resume != null && job != null)
        {
            var resumeText = await _service.DownloadResumeTextAsync(resume.FileUrl);

            var score = await GetAiScoreAsync(resumeText, job.Description);

            var application = _context.Applications
                .FirstOrDefault(a => a.UserId == userGuid && a.JobId == dto.JobId);

            if (application != null)
            {
                application.Score = score;
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = result, score });
        }

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