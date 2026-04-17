public interface IAuthService
{
    Object Register(RegisterDto dto);
    string Login(LoginDto dto);
}