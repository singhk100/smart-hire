using AutoMapper;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User
        CreateMap<RegisterDto, User>()
            .ForMember(dest => dest.Password_Hash, opt => opt.Ignore());

        CreateMap<User, UserResponseDto>();

        // Job
        CreateMap<CreateJobDto, Job>();
        CreateMap<Job, JobResponseDto>();

        // Application
        CreateMap<Application, ApplicationResponseDto>()
            .ForMember(dest => dest.JobTitle, opt => opt.Ignore());

        // Resume
        CreateMap<Resume, ResumeResponseDto>();
    }
}