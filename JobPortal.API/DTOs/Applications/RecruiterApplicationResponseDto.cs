public class RecruiterApplicationResponseDto
{
    public Guid Id { get; set; }
    public Guid CandidateId { get; set; }
    public string CandidateName { get; set; }
    public string CandidateEmail { get; set; }
    public Guid ResumeId { get; set; }
    public string JobTitle { get; set; }
    public ApplicationStatus Status { get; set; }
    public int Score { get; set; }
}
