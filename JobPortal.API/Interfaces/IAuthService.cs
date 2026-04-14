public interface IAuthService
{
    string Register(RegisterDto dto);
    string Login(LoginDto dto);
}