namespace JobPortal.API.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}
