using JobPortal.API.Enums;
using JobPortal.API.Models;
using System;
using System.ComponentModel.DataAnnotations;

public class User
{
    public Guid Id { get; set; }

    [Required]
    public string Name { get; set; }

    [Required]
    public string Email { get; set; }

    public string Password_Hash { get; set; }

    public UserRole Role { get; set; }
    public ICollection<RefreshTokens> RefreshTokens { get; set; } = new List<RefreshTokens>();
}