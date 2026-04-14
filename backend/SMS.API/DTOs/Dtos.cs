using SMS.API.Models;

namespace SMS.API.DTOs;

// Auth DTOs
public record LoginDto(string Username, string Password);
public record RegisterDto(string Username, string Email, string Password, UserRole Role);
public record AuthResponseDto(string Token, string Username, string Email, string Role, int UserId);
public record ChangePasswordDto(string CurrentPassword, string NewPassword);

// Student DTOs
public record StudentCreateDto(
    string StudentIdNumber, string FirstName, string LastName,
    DateTime DateOfBirth, string Gender, string Address,
    string PhoneNumber, string Email, int? ClassId, int? ParentId);

public record StudentUpdateDto(
    string FirstName, string LastName, DateTime DateOfBirth,
    string Gender, string Address, string PhoneNumber,
    string Email, int? ClassId, int? ParentId, bool IsActive);

public record StudentResponseDto(
    int Id, string StudentIdNumber, string FirstName, string LastName,
    DateTime DateOfBirth, string Gender, string Address, string PhoneNumber,
    string Email, DateTime EnrollmentDate, bool IsActive,
    string? ClassName, string? ParentName);

// Staff DTOs
public record StaffCreateDto(
    string StaffIdNumber, string FirstName, string LastName,
    DateTime DateOfBirth, string Gender, string Address,
    string PhoneNumber, string Email, string Department,
    string Position, DateTime HireDate, decimal Salary);

public record StaffUpdateDto(
    string FirstName, string LastName, DateTime DateOfBirth,
    string Gender, string Address, string PhoneNumber,
    string Email, string Department, string Position,
    decimal Salary, bool IsActive);

public record StaffResponseDto(
    int Id, string StaffIdNumber, string FirstName, string LastName,
    DateTime DateOfBirth, string Gender, string Address, string PhoneNumber,
    string Email, string Department, string Position, DateTime HireDate,
    decimal Salary, bool IsActive);

// Parent DTOs
public record ParentCreateDto(
    string FirstName, string LastName, string PhoneNumber,
    string Email, string Address, string Occupation);

public record ParentResponseDto(
    int Id, string FirstName, string LastName, string PhoneNumber,
    string Email, string Address, string Occupation, List<string> StudentNames);

// Class DTOs
public record ClassCreateDto(string Name, string Section, string AcademicYear, int? TeacherId);
public record ClassResponseDto(int Id, string Name, string Section, string AcademicYear, string? TeacherName, int StudentCount);

// Subject DTOs
public record SubjectCreateDto(string Name, string Code, string Description, int? ClassId, int? TeacherId);
public record SubjectResponseDto(int Id, string Name, string Code, string Description, string? ClassName, string? TeacherName);

// Attendance DTOs
public record AttendanceCreateDto(int StudentId, DateTime Date, AttendanceStatus Status, string Remarks);
public record AttendanceBulkCreateDto(int ClassId, DateTime Date, List<AttendanceEntryDto> Entries);
public record AttendanceEntryDto(int StudentId, AttendanceStatus Status, string Remarks);
public record AttendanceResponseDto(int Id, int StudentId, string StudentName, DateTime Date, AttendanceStatus Status, string Remarks);

// Exam DTOs
public record ExamCreateDto(string Name, string ExamType, DateTime StartDate, DateTime EndDate, string AcademicYear);
public record ExamResponseDto(int Id, string Name, string ExamType, DateTime StartDate, DateTime EndDate, string AcademicYear);

// Grade DTOs
public record GradeCreateDto(int StudentId, int SubjectId, int ExamId, decimal MarksObtained, decimal MaxMarks, string GradeLetter, string Remarks);
public record GradeResponseDto(int Id, string StudentName, string SubjectName, string ExamName, decimal MarksObtained, decimal MaxMarks, string GradeLetter, string Remarks);

// Fee DTOs
public record FeeStructureCreateDto(string ClassName, string FeeType, decimal Amount, string AcademicYear, string Description);
public record FeeStructureResponseDto(int Id, string ClassName, string FeeType, decimal Amount, string AcademicYear, string Description);
public record FeePaymentCreateDto(int StudentId, int FeeStructureId, decimal AmountPaid, string PaymentMethod, string TransactionId);
public record FeePaymentResponseDto(int Id, string StudentName, string FeeType, decimal AmountPaid, DateTime PaymentDate, string PaymentMethod, string TransactionId, PaymentStatus Status);

// Timetable DTOs
public record TimetableCreateDto(int ClassId, int SubjectId, string DayOfWeek, TimeSpan StartTime, TimeSpan EndTime);
public record TimetableResponseDto(int Id, string ClassName, string SubjectName, string DayOfWeek, TimeSpan StartTime, TimeSpan EndTime);

// Library DTOs
public record LibraryBookCreateDto(string Title, string Author, string ISBN, string Category, int TotalCopies);
public record LibraryBookResponseDto(int Id, string Title, string Author, string ISBN, string Category, int TotalCopies, int AvailableCopies);
public record BookIssueCreateDto(int BookId, int StudentId, DateTime DueDate);
public record BookIssueResponseDto(int Id, string BookTitle, string StudentName, DateTime IssueDate, DateTime DueDate, DateTime? ReturnDate, decimal Fine);

// Notification DTOs
public record NotificationCreateDto(string Title, string Message, string TargetRole, int? TargetUserId);
public record NotificationResponseDto(int Id, string Title, string Message, string SentBy, string TargetRole, DateTime CreatedAt, bool IsRead);

// Dashboard DTOs
public record DashboardDto(int TotalStudents, int TotalStaff, int TotalClasses, int TotalSubjects, decimal TotalFeesCollected, decimal TotalFeesPending, int BooksInLibrary, List<AttendanceSummaryDto> RecentAttendance);
public record AttendanceSummaryDto(DateTime Date, int PresentCount, int AbsentCount, int LateCount);
