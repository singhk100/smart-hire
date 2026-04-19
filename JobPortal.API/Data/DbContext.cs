using JobPortal.API.Enums;
using JobPortal.API.Models;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<User> Users { get; set; }
    public DbSet<Job> Jobs { get; set; }
    public DbSet<Application> Applications { get; set; }
    public DbSet<Resume> Resumes { get; set; }
    public DbSet<RefreshTokens> RefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresEnum<UserRole>();
        modelBuilder.HasPostgresEnum<ApplicationStatus>();
        // Users table
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.Password_Hash).HasColumnName("password_hash");
            entity.Property(e => e.Role).HasColumnName("role");
        });

        // Jobs table
        modelBuilder.Entity<Job>(entity =>
        {
            entity.ToTable("jobs");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.RecruiterId).HasColumnName("recruiter_id");

            // to map skills_required (Postgres array):
            // entity.Property<string[]>("SkillsRequired").HasColumnName("skills_required");
        });

        // Applications table
        modelBuilder.Entity<Application>(entity =>
        {
            entity.ToTable("applications");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.JobId).HasColumnName("job_id");
            entity.Property(e => e.ResumeId).HasColumnName("resume_id");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.Score).HasColumnName("score");
        });

        // Resumes table
        modelBuilder.Entity<Resume>(entity =>
        {
            entity.ToTable("resumes");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.FileUrl).HasColumnName("file_url");
        });
        // refresh_tokens table
        modelBuilder.Entity<RefreshTokens>(entity =>
        {
            entity.ToTable("refresh_tokens");

            entity.HasKey(rt => rt.Id);

            // 👇 explicitly map property to lowercase column
            entity.Property(rt => rt.Id).HasColumnName("id");

            entity.Property(rt => rt.Token)
                  .HasColumnName("token")
                  .IsRequired();

            entity.Property(rt => rt.UserId).HasColumnName("user_id");
            entity.Property(rt => rt.ExpiresAt).HasColumnName("expires_at");
            entity.Property(rt => rt.RevokedAt).HasColumnName("revoked_at");
            entity.Property(rt => rt.CreatedAt).HasColumnName("created_at");

            entity.HasIndex(rt => rt.Token).IsUnique();
            entity.HasIndex(rt => rt.UserId);

            entity.HasOne(rt => rt.User)
                  .WithMany(u => u.RefreshTokens)
                  .HasForeignKey(rt => rt.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });


        // to add AuditLogs or Notifications entities:
        // modelBuilder.Entity<AuditLog>(entity =>
        // {
        //     entity.ToTable("audit_logs");
        //     entity.Property(e => e.Id).HasColumnName("id");
        //     entity.Property(e => e.UserId).HasColumnName("user_id");
        //     entity.Property(e => e.Action).HasColumnName("action");
        //     entity.Property(e => e.EntityName).HasColumnName("entity_name");
        //     entity.Property(e => e.EntityId).HasColumnName("entity_id");
        //     entity.Property(e => e.OldData).HasColumnName("old_data");
        //     entity.Property(e => e.NewData).HasColumnName("new_data");
        // });

        // modelBuilder.Entity<Notification>(entity =>
        // {
        //     entity.ToTable("notifications");
        //     entity.Property(e => e.Id).HasColumnName("id");
        //     entity.Property(e => e.UserId).HasColumnName("user_id");
        //     entity.Property(e => e.Message).HasColumnName("message");
        //     entity.Property(e => e.IsRead).HasColumnName("is_read");
        // });
    }

}