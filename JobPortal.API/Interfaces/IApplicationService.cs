using System;
using System.Collections.Generic;

public interface IApplicationService
{
    Task<string> ApplyAsync(Guid userId, ApplyJobDto dto);
    List<ApplicationResponseDto> GetMyApplications(Guid userId);
    List<RecruiterApplicationResponseDto> GetRecruiterApplications(Guid recruiterId);
    CandidateProfileDto GetCandidateProfileForRecruiter(Guid recruiterId, Guid candidateId);
    string UpdateStatus(UpdateApplicationStatusDto dto);
    string DeleteMyApplication(Guid userId, Guid applicationId);
    Task<string> DownloadResumeTextAsync(string fileUrl);
}