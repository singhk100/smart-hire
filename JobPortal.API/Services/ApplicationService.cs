using System;
using System.Linq;
using System.Collections.Generic;

public class ApplicationService : IApplicationService
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public ApplicationService(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public string Apply(Guid userId, ApplyJobDto dto)
    {
        var exists = _context.Applications
            .Any(x => x.UserId == userId && x.JobId == dto.JobId);

        if (exists)
            return "Already applied";

        var application = new Application
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            JobId = dto.JobId,
            ResumeId = dto.ResumeId,
            Status = "applied",
            Score = 0
        };

        _context.Applications.Add(application);
        _context.SaveChanges();

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
}