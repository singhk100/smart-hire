namespace JobPortal.API.Models
{
    public class RefreshTokens
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid UserId { get; set; }
        public User User { get; set; }   // navigation property

        public string Token { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }
        public DateTime? RevokedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

}
