using AutoMapper;
using DocumentFormat.OpenXml.Packaging;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using UglyToad.PdfPig;

public class ApplicationService : IApplicationService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;
    private readonly IConfiguration ConfigurationManager;

    public ApplicationService(AppDbContext context, IMapper mapper, IHttpClientFactory httpClientFactory, IConfiguration configurationManager)
    {
        _context = context;
        _mapper = mapper;
        _httpClientFactory = httpClientFactory;
        ConfigurationManager = configurationManager;
    }

    public async Task<string> ApplyAsync(Guid userId, ApplyJobDto dto)
    {
        var exists = await _context.Applications
            .AnyAsync(x => x.UserId == userId && x.JobId == dto.JobId);

        if (exists)
            return "Already applied";

        var application = new Application
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            JobId = dto.JobId,
            ResumeId = dto.ResumeId,
            Status = ApplicationStatus.applied,
            Score = 0
        };

        await _context.Applications.AddAsync(application);
        await _context.SaveChangesAsync();

        return "Applied successfully";
    }


    public List<ApplicationResponseDto> GetMyApplications(Guid userId)
    {
        var apps = _context.Applications
            .Where(x => x.UserId == userId)
            .Join(_context.Jobs,
                app => app.JobId,
                job => job.Id,
                (app, job) => new ApplicationResponseDto
                {
                    Id = app.Id,
                    JobTitle = job.Title,
                    Status = app.Status,
                    Score = app.Score
                })
            .ToList();

        return apps;
    }

    public List<RecruiterApplicationResponseDto> GetRecruiterApplications(Guid recruiterId)
    {
        var apps = (from app in _context.Applications
                    join job in _context.Jobs on app.JobId equals job.Id
                    join user in _context.Users on app.UserId equals user.Id
                    where job.RecruiterId == recruiterId
                    select new RecruiterApplicationResponseDto
                    {
                        Id = app.Id,
                        CandidateId = user.Id,
                        CandidateName = user.Name,
                        CandidateEmail = user.Email,
                        ResumeId = app.ResumeId,
                        JobTitle = job.Title,
                        Status = app.Status,
                        Score = app.Score
                    }).ToList();

        return apps;
    }

    public CandidateProfileDto GetCandidateProfileForRecruiter(Guid recruiterId, Guid candidateId)
    {
        var hasAccess = (from app in _context.Applications
                         join job in _context.Jobs on app.JobId equals job.Id
                         where app.UserId == candidateId && job.RecruiterId == recruiterId
                         select app.Id).Any();

        if (!hasAccess)
            return null;

        return _context.Users
            .Where(u => u.Id == candidateId)
            .Select(u => new CandidateProfileDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email
            })
            .FirstOrDefault();
    }

    public string UpdateStatus(UpdateApplicationStatusDto dto)
    {
        var app = _context.Applications
            .FirstOrDefault(x => x.Id == dto.ApplicationId);

        if (app == null)
            return "Application not found";

        app.Status = dto.Status;

        _context.SaveChanges();

        return "Status updated";
    }

    public string DeleteMyApplication(Guid userId, Guid applicationId)
    {
        var app = _context.Applications
            .FirstOrDefault(x => x.Id == applicationId && x.UserId == userId);

        if (app == null)
            return "Application not found";

        _context.Applications.Remove(app);
        _context.SaveChanges();

        return "Application removed";
    }
    private bool TryGetSupabaseConfig(out string url, out string serviceRoleKey, out string bucket)
    {
        url = ConfigurationManager["Supabase:Url"] ?? "";
        serviceRoleKey = ConfigurationManager["Supabase:ServiceRoleKey"] ?? "";
        bucket = ConfigurationManager["Supabase:ResumeBucket"] ?? "resumes";
        return !string.IsNullOrWhiteSpace(url) && !string.IsNullOrWhiteSpace(serviceRoleKey);
    }

    private static string EncodeObjectPath(string objectPath)
    {
        return string.Join("/", objectPath
            .Split('/', StringSplitOptions.RemoveEmptyEntries)
            .Select(Uri.EscapeDataString));
    }

    public async Task<string> DownloadResumeTextAsync(string fileUrl)
    {
        if (!TryGetSupabaseConfig(out var supabaseUrl, out var supabaseServiceKey, out var bucket))
            throw new InvalidOperationException("Supabase config missing.");

        var client = _httpClientFactory.CreateClient();
        var url = $"{supabaseUrl.TrimEnd('/')}/storage/v1/object/{bucket}/{EncodeObjectPath(fileUrl)}";

        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Add("apikey", supabaseServiceKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", supabaseServiceKey);

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var bytes = await response.Content.ReadAsByteArrayAsync();
        var ext = Path.GetExtension(fileUrl).ToLowerInvariant();

        if (ext == ".pdf")
        {
            using var pdf = PdfDocument.Open(new MemoryStream(bytes));
            var text = string.Join("\n", pdf.GetPages().Select(p => p.Text));
            return text;
        }
        else if (ext == ".docx")
        {
            using var doc = WordprocessingDocument.Open(new MemoryStream(bytes), false);
            return doc.MainDocumentPart.Document.Body.InnerText;
        }
        else if (ext == ".doc")
        {
            // For .doc, you may need a library like NPOI
            return "DOC parsing not implemented";
        }

        return System.Text.Encoding.UTF8.GetString(bytes);
    }

}