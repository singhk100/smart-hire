public class ApplicationResponseDto
{
    public Guid Id { get; set; }
    public string JobTitle { get; set; }
    public ApplicationStatus Status { get; set; }
    public int Score { get; set; }
}