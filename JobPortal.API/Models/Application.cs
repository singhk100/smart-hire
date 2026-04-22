public enum ApplicationStatus
{
    applied,
    shortlisted,
    rejected,
    inprocess
}

public class Application
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid JobId { get; set; }
    public Guid ResumeId { get; set; }
    public ApplicationStatus Status { get; set; }
    public int Score { get; set; }
    public DateTime CreatedAt { get; set; }
}
