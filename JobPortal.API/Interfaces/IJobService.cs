using System.Collections.Generic;
using System.Linq;

public interface IJobService
{
    List<Job> GetAll();
    Job Create(Job job);
}