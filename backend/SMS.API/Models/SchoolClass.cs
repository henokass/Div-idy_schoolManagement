using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS.API.Models;

public class SchoolClass
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(10)]
    public string Section { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string AcademicYear { get; set; } = string.Empty;

    public int? TeacherId { get; set; }
    [ForeignKey("TeacherId")]
    public Staff? ClassTeacher { get; set; }

    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
    public ICollection<Timetable> Timetables { get; set; } = new List<Timetable>();
}
