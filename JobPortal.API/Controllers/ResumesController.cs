using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/resumes")]
public class ResumesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ResumesController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var filePath = Path.Combine("uploads", file.FileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var resume = new Resume
        {
            Id = Guid.NewGuid(),
            UserId = Guid.Parse(userId),
            FileUrl = filePath
        };

        _context.Resumes.Add(resume);
        _context.SaveChanges();

        return Ok(resume);
    }

    [Authorize]
    [HttpGet]
    public IActionResult GetMyResumes()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var resumes = _context.Resumes
            .Where(x => x.UserId == Guid.Parse(userId))
            .ToList();

        return Ok(resumes);
    }
}