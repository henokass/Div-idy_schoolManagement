using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS.API.Models;

public class Subject
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Code { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public int? ClassId { get; set; }
    [ForeignKey("ClassId")]
    public SchoolClass? Class { get; set; }

    public int? TeacherId { get; set; }
    [ForeignKey("TeacherId")]
    public Staff? Teacher { get; set; }

    public ICollection<Grade> Grades { get; set; } = new List<Grade>();
    public ICollection<Timetable> Timetables { get; set; } = new List<Timetable>();
}
