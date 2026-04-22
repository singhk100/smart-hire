using System.Collections.Generic;
using System.Linq;

public interface IJobService
{
    List<Job> GetAll();
    Job Create(Guid recruiterId, CreateJobDto dto);
    string Delete(Guid recruiterId, Guid jobId);
}