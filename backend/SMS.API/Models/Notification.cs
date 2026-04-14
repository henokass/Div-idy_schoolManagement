using System.ComponentModel.DataAnnotations;

namespace SMS.API.Models;

public class Notification
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;

    [MaxLength(50)]
    public string SentBy { get; set; } = string.Empty;

    [MaxLength(50)]
    public string TargetRole { get; set; } = string.Empty;

    public int? TargetUserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsRead { get; set; }
}
