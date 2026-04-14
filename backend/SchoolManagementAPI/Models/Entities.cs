using System.ComponentModel.DataAnnotations;

namespace SchoolManagementAPI.Models;

public enum Role
{
    ADMIN,
    TEACHER,
    STUDENT,
    PARENT,
    ACCOUNTANT
}

public enum Gender
{
    MALE,
    FEMALE
}

public enum AttendanceStatus
{
    PRESENT,
    ABSENT,
    LATE,
    EXCUSED
}

public enum PaymentStatus
{
    PAID,
    PARTIAL,
    UNPAID,
    OVERDUE
}

public enum BookStatus
{
    AVAILABLE,
    ISSUED,
    LOST,
    DAMAGED
}

public class User
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(50)]
    public string Username { get; set; } = string.Empty;
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    [Required, MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    [Required, MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
    [MaxLength(200)]
    public string? Email { get; set; }
    [MaxLength(20)]
    public string? Phone { get; set; }
    public Role Role { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Student? Student { get; set; }
    public Teacher? Teacher { get; set; }
    public Parent? Parent { get; set; }
    public ICollection<Notification> ReceivedNotifications { get; set; } = new List<Notification>();
    public ICollection<Notification> SentNotifications { get; set; } = new List<Notification>();
}

public class Student
{
    [Key]
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    [Required, MaxLength(50)]
    public string AdmissionNumber { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    [MaxLength(500)]
    public string? Address { get; set; }
    public int? ClassId { get; set; }
    public Class? Class { get; set; }
    public int? ParentId { get; set; }
    public Parent? Parent { get; set; }
    public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    public ICollection<Grade> Grades { get; set; } = new List<Grade>();
    public ICollection<FeePayment> FeePayments { get; set; } = new List<FeePayment>();
    public ICollection<BookIssue> BookIssues { get; set; } = new List<BookIssue>();
}

public class Teacher
{
    [Key]
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    [Required, MaxLength(50)]
    public string EmployeeId { get; set; } = string.Empty;
    [MaxLength(200)]
    public string? Qualification { get; set; }
    public DateTime JoinDate { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    public ICollection<SubjectTeacher> SubjectTeachers { get; set; } = new List<SubjectTeacher>();
    public ICollection<Class> Classes { get; set; } = new List<Class>();
    public ICollection<TimetableSlot> TimetableSlots { get; set; } = new List<TimetableSlot>();
}

public class Parent
{
    [Key]
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    [MaxLength(100)]
    public string? Occupation { get; set; }
    [MaxLength(500)]
    public string? Address { get; set; }

    public ICollection<Student> Students { get; set; } = new List<Student>();
}

public class Class
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(20)]
    public string? Section { get; set; }
    public int Capacity { get; set; } = 40;
    public int? TeacherId { get; set; }
    public Teacher? Teacher { get; set; }

    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<ClassSubject> ClassSubjects { get; set; } = new List<ClassSubject>();
    public ICollection<TimetableSlot> TimetableSlots { get; set; } = new List<TimetableSlot>();
    public ICollection<FeeStructure> FeeStructures { get; set; } = new List<FeeStructure>();
}

public class Subject
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    [Required, MaxLength(20)]
    public string Code { get; set; } = string.Empty;
    [MaxLength(500)]
    public string? Description { get; set; }

    public ICollection<SubjectTeacher> SubjectTeachers { get; set; } = new List<SubjectTeacher>();
    public ICollection<ClassSubject> ClassSubjects { get; set; } = new List<ClassSubject>();
    public ICollection<Grade> Grades { get; set; } = new List<Grade>();
    public ICollection<TimetableSlot> TimetableSlots { get; set; } = new List<TimetableSlot>();
}

public class SubjectTeacher
{
    [Key]
    public int Id { get; set; }
    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
    public int TeacherId { get; set; }
    public Teacher Teacher { get; set; } = null!;
}

public class ClassSubject
{
    [Key]
    public int Id { get; set; }
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;
    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
}

public class Attendance
{
    [Key]
    public int Id { get; set; }
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
    public int ClassId { get; set; }
    public DateTime Date { get; set; }
    public AttendanceStatus Status { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Grade
{
    [Key]
    public int Id { get; set; }
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
    public double Score { get; set; }
    public double MaxScore { get; set; } = 100;
    [MaxLength(5)]
    public string? GradeLetter { get; set; }
    [MaxLength(50)]
    public string ExamType { get; set; } = string.Empty;
    [MaxLength(20)]
    public string Term { get; set; } = string.Empty;
    [MaxLength(20)]
    public string AcademicYear { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class TimetableSlot
{
    [Key]
    public int Id { get; set; }
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;
    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
    public int TeacherId { get; set; }
    public Teacher Teacher { get; set; } = null!;
    [Required, MaxLength(20)]
    public string Day { get; set; } = string.Empty;
    [Required, MaxLength(10)]
    public string StartTime { get; set; } = string.Empty;
    [Required, MaxLength(10)]
    public string EndTime { get; set; } = string.Empty;
    [MaxLength(50)]
    public string? Room { get; set; }
}

public class FeeStructure
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    public double Amount { get; set; }
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;
    [MaxLength(20)]
    public string Term { get; set; } = string.Empty;
    [MaxLength(20)]
    public string AcademicYear { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }

    public ICollection<FeePayment> Payments { get; set; } = new List<FeePayment>();
}

public class FeePayment
{
    [Key]
    public int Id { get; set; }
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
    public int FeeStructureId { get; set; }
    public FeeStructure FeeStructure { get; set; } = null!;
    public double AmountPaid { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    [MaxLength(50)]
    public string? PaymentMethod { get; set; }
    [MaxLength(100)]
    public string? ReceiptNumber { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.UNPAID;
}

public class Book
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    [Required, MaxLength(200)]
    public string Author { get; set; } = string.Empty;
    [MaxLength(20)]
    public string? ISBN { get; set; }
    [MaxLength(100)]
    public string? Category { get; set; }
    public int Quantity { get; set; } = 1;
    public int Available { get; set; } = 1;
    public BookStatus Status { get; set; } = BookStatus.AVAILABLE;

    public ICollection<BookIssue> BookIssues { get; set; } = new List<BookIssue>();
}

public class BookIssue
{
    [Key]
    public int Id { get; set; }
    public int BookId { get; set; }
    public Book Book { get; set; } = null!;
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public double Fine { get; set; }
}

public class Notification
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    [Required]
    public string Message { get; set; } = string.Empty;
    public int RecipientId { get; set; }
    public User Recipient { get; set; } = null!;
    public int? SenderId { get; set; }
    public User? Sender { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Announcement
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    [Required]
    public string Content { get; set; } = string.Empty;
    [MaxLength(50)]
    public string Audience { get; set; } = "ALL";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
}
