public class JobResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public List<string> SkillsRequired { get; set; }
}