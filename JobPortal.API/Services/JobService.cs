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

    public Job Create(Job job)
    {
        job.Id = Guid.NewGuid();
        _context.Jobs.Add(job);
        _context.SaveChanges();
        return job;
    }
}