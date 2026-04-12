using System;
using System.Collections.Generic;

public interface IApplicationService
{
    string Apply(Guid userId, ApplyJobDto dto);
    List<ApplicationResponseDto> GetMyApplications(Guid userId);
    string UpdateStatus(UpdateApplicationStatusDto dto);
}