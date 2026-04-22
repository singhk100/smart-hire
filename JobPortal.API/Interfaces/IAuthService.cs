using JobPortal.API.DTOs;

public interface IAuthService
{
    Object Register(RegisterDto dto);
    AuthResponseDto Login(LoginDto dto);
}