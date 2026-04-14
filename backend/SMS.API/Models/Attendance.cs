using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS.API.Models;

public enum AttendanceStatus
{
    Present,
    Absent,
    Late,
    Excused
}

public class Attendance
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }
    [ForeignKey("StudentId")]
    public Student Student { get; set; } = null!;

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public AttendanceStatus Status { get; set; }

    [MaxLength(200)]
    public string Remarks { get; set; } = string.Empty;
}
