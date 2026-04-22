    using AutoMapper;
    using JobPortal.API.DTOs;
using JobPortal.API.Models;
using System.Linq;
    using System.Security.Cryptography;

    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly JwtService _jwtService;
        private readonly IConfiguration _config;

        public AuthService(AppDbContext context, IMapper mapper, JwtService jwtService, IConfiguration config)
        {
            _context = context;
            _mapper = mapper;
            _jwtService = jwtService;
            _config = config;
            _jwtService = jwtService;
        }

    public AuthResponseDto Login(LoginDto dto)
    {
        // Find user by email
        var user = _context.Users.FirstOrDefault(x => x.Email == dto.Email);
        if (user == null) return null;

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.Password_Hash))
            return null;

        // Generate tokens
        var accessToken = _jwtService.GenerateToken(user);
        var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        _context.RefreshTokens.Add(new RefreshTokens
        {
            Token = refreshToken,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });
        _context.SaveChanges();

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(
                Convert.ToDouble(_config["Jwt:ExpiryMinutes"])),
            Message = "Login successful"
        };
    }



    public object Register(RegisterDto dto)
        {
            if (_context.Users.Any(x => x.Email == dto.Email))
                return new { message = "User already exists" };

            var user = _mapper.Map<User>(dto);

            user.Password_Hash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            user.Id = Guid.NewGuid();

            _context.Users.Add(user);
            _context.SaveChanges();

            return new { message = "User already exists" };
        }

    }