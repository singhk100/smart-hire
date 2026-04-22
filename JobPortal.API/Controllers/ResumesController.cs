using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Net.Http.Headers;

[ApiController]
[Route("api/resumes")]
public class ResumesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private static readonly string[] AllowedExtensions = [".pdf", ".doc", ".docx"];
    private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

    public ResumesController(AppDbContext context, IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    [Authorize]
    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized("Invalid user token.");
        if (file == null || file.Length == 0)
            return BadRequest("Please select a file.");
        if (file.Length > MaxFileSize)
            return BadRequest("File size must be less than 5MB.");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            return BadRequest("Only PDF, DOC, and DOCX files are allowed.");

        if (!TryGetSupabaseConfig(out var supabaseUrl, out var supabaseServiceKey, out var bucket))
            return StatusCode(500, "Supabase storage config missing.");

        var userGuid = Guid.Parse(userId);
        var objectPath = $"{userGuid}/{Guid.NewGuid()}{ext}";
        var uploadResponse = await UploadToSupabaseAsync(supabaseUrl, supabaseServiceKey, bucket, objectPath, file);
        if (!uploadResponse.IsSuccessStatusCode)
        {
            var err = await uploadResponse.Content.ReadAsStringAsync();
            return StatusCode((int)uploadResponse.StatusCode, $"Resume upload failed: {err}");
        }

        // Replace mode: keep only latest resume per user.
        var existingResumes = _context.Resumes
            .Where(r => r.UserId == userGuid)
            .ToList();

        foreach (var existing in existingResumes)
        {
            if (!string.IsNullOrWhiteSpace(existing.FileUrl))
            {
                await DeleteFromSupabaseAsync(supabaseUrl, supabaseServiceKey, bucket, existing.FileUrl);
            }
        }

        if (existingResumes.Count > 0)
            _context.Resumes.RemoveRange(existingResumes);

        var resume = new Resume
        {
            Id = Guid.NewGuid(),
            UserId = userGuid,
            FileUrl = objectPath
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
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized("Invalid user token.");

        var resumes = _context.Resumes
            .Where(x => x.UserId == Guid.Parse(userId))
            .ToList();

        return Ok(resumes);
    }

    [Authorize]
    [HttpGet("my/{resumeId:guid}/download")]
    public async Task<IActionResult> DownloadMyResume(Guid resumeId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized("Invalid user token.");

        var resume = _context.Resumes
            .FirstOrDefault(r => r.Id == resumeId && r.UserId == Guid.Parse(userId));
        if (resume == null) return NotFound("Resume not found");

        return await DownloadFileFromResumeAsync(resume);
    }

    [Authorize(Roles = "recruiter")]
    [HttpGet("recruiter/{resumeId:guid}/download")]
    public async Task<IActionResult> DownloadCandidateResume(Guid resumeId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized("Invalid user token.");

        var recruiterId = Guid.Parse(userId);
        var resume = _context.Resumes.FirstOrDefault(r => r.Id == resumeId);
        if (resume == null) return NotFound("Resume not found");

        var hasAccess = (from app in _context.Applications
                         join job in _context.Jobs on app.JobId equals job.Id
                         where app.UserId == resume.UserId && job.RecruiterId == recruiterId
                         select app.Id).Any();
        if (!hasAccess) return Forbid();

        return await DownloadFileFromResumeAsync(resume);
    }

    private async Task<IActionResult> DownloadFileFromResumeAsync(Resume resume)
    {
        if (string.IsNullOrWhiteSpace(resume.FileUrl))
            return NotFound("Resume file path missing.");

        if (!TryGetSupabaseConfig(out var supabaseUrl, out var supabaseServiceKey, out var bucket))
            return StatusCode(500, "Supabase storage config missing.");

        var downloadResponse = await DownloadFromSupabaseAsync(supabaseUrl, supabaseServiceKey, bucket, resume.FileUrl);
        if (!downloadResponse.IsSuccessStatusCode)
            return NotFound("Resume file not found in storage.");

        var bytes = await downloadResponse.Content.ReadAsByteArrayAsync();
        var fileName = Path.GetFileName(resume.FileUrl);
        return File(bytes, GetMimeType(fileName), fileName);
    }

    private bool TryGetSupabaseConfig(out string url, out string serviceRoleKey, out string bucket)
    {
        url = _configuration["Supabase:Url"] ?? "";
        serviceRoleKey = _configuration["Supabase:ServiceRoleKey"] ?? "";
        bucket = _configuration["Supabase:ResumeBucket"] ?? "resumes";
        return !string.IsNullOrWhiteSpace(url) && !string.IsNullOrWhiteSpace(serviceRoleKey);
    }

    private async Task<HttpResponseMessage> UploadToSupabaseAsync(
        string supabaseUrl,
        string serviceRoleKey,
        string bucket,
        string objectPath,
        IFormFile file)
    {
        var client = _httpClientFactory.CreateClient();
        var url = $"{supabaseUrl.TrimEnd('/')}/storage/v1/object/{bucket}/{EncodeObjectPath(objectPath)}";
        using var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Headers.Add("apikey", serviceRoleKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", serviceRoleKey);
        request.Headers.Add("x-upsert", "true");

        var streamContent = new StreamContent(file.OpenReadStream());
        streamContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType ?? "application/octet-stream");
        request.Content = streamContent;

        return await client.SendAsync(request);
    }

    private async Task DeleteFromSupabaseAsync(
        string supabaseUrl,
        string serviceRoleKey,
        string bucket,
        string objectPath)
    {
        if (string.IsNullOrWhiteSpace(objectPath)) return;
        var client = _httpClientFactory.CreateClient();
        var url = $"{supabaseUrl.TrimEnd('/')}/storage/v1/object/{bucket}/{EncodeObjectPath(objectPath)}";
        using var request = new HttpRequestMessage(HttpMethod.Delete, url);
        request.Headers.Add("apikey", serviceRoleKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", serviceRoleKey);
        await client.SendAsync(request);
    }

    private async Task<HttpResponseMessage> DownloadFromSupabaseAsync(
        string supabaseUrl,
        string serviceRoleKey,
        string bucket,
        string objectPath)
    {
        var client = _httpClientFactory.CreateClient();
        var url = $"{supabaseUrl.TrimEnd('/')}/storage/v1/object/{bucket}/{EncodeObjectPath(objectPath)}";
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Add("apikey", serviceRoleKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", serviceRoleKey);
        return await client.SendAsync(request);
    }

    private static string EncodeObjectPath(string objectPath)
    {
        return string.Join("/", objectPath.Split('/', StringSplitOptions.RemoveEmptyEntries).Select(Uri.EscapeDataString));
    }

    private static string GetMimeType(string fileName)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        return ext switch
        {
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            _ => "application/octet-stream"
        };
    }
}