using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS.API.Models;

public class Timetable
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ClassId { get; set; }
    [ForeignKey("ClassId")]
    public SchoolClass Class { get; set; } = null!;

    [Required]
    public int SubjectId { get; set; }
    [ForeignKey("SubjectId")]
    public Subject Subject { get; set; } = null!;

    [Required, MaxLength(15)]
    public string DayOfWeek { get; set; } = string.Empty;

    [Required]
    public TimeSpan StartTime { get; set; }

    [Required]
    public TimeSpan EndTime { get; set; }
}
