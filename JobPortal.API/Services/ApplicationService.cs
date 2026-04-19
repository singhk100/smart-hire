using System;
using System.Linq;
using System.Collections.Generic;
using AutoMapper;

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
            Status = ApplicationStatus.applied,
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
}