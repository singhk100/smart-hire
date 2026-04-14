using System.Linq;
using AutoMapper;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;
    private readonly JwtService _jwtService;

    public AuthService(AppDbContext context, IMapper mapper, JwtService jwtService)
    {
        _context = context;
        _mapper = mapper;
        _jwtService = jwtService;
    }

    public string Login(LoginDto dto)
    {
        var user = _context.Users.FirstOrDefault(x => x.Email == dto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password_Hash))
            return null;

        return _jwtService.GenerateToken(user);
    }

    public string Register(RegisterDto dto)
    {
        if (_context.Users.Any(x => x.Email == dto.Email))
            return "User already exists";

        var user = _mapper.Map<User>(dto);

        user.Password_Hash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        user.Id = Guid.NewGuid();

        _context.Users.Add(user);
        _context.SaveChanges();

        return "Registered";
    }

}