using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS.API.Models;

public class Student
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(20)]
    public string StudentIdNumber { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    public DateTime DateOfBirth { get; set; }

    [MaxLength(10)]
    public string Gender { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;

    // Foreign keys
    public int? UserId { get; set; }
    [ForeignKey("UserId")]
    public User? User { get; set; }

    public int? ClassId { get; set; }
    [ForeignKey("ClassId")]
    public SchoolClass? Class { get; set; }

    public int? ParentId { get; set; }
    [ForeignKey("ParentId")]
    public Parent? Parent { get; set; }

    // Navigation
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    public ICollection<Grade> Grades { get; set; } = new List<Grade>();
    public ICollection<FeePayment> FeePayments { get; set; } = new List<FeePayment>();
    public ICollection<BookIssue> BookIssues { get; set; } = new List<BookIssue>();
}
