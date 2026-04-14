using AutoMapper;
using Supabase.Gotrue;
public class JobService : IJobService
{
    private readonly AppDbContext _context;

    private readonly IMapper _mapper;

    public JobService(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public List<Job> GetAll()
    {
        return _context.Jobs.ToList();
    }

    public Job Create(Guid recruiterId, CreateJobDto dto)
    {
        var job = _mapper.Map<Job>(dto);
        job.Id = Guid.NewGuid();
        job.RecruiterId = recruiterId;

        _context.Jobs.Add(job);
        _context.SaveChanges();
        return job;
    }
}