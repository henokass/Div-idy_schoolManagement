using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS.API.Models;

public class Grade
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }
    [ForeignKey("StudentId")]
    public Student Student { get; set; } = null!;

    [Required]
    public int SubjectId { get; set; }
    [ForeignKey("SubjectId")]
    public Subject Subject { get; set; } = null!;

    [Required]
    public int ExamId { get; set; }
    [ForeignKey("ExamId")]
    public Exam Exam { get; set; } = null!;

    [Column(TypeName = "decimal(5,2)")]
    public decimal MarksObtained { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal MaxMarks { get; set; }

    [MaxLength(5)]
    public string GradeLetter { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Remarks { get; set; } = string.Empty;
}
