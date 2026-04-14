using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.DTOs;

public record LoginRequest(string Username, string Password);
public record LoginResponse(string Token, UserDto User);
public record RegisterRequest(string Username, string Password, string FirstName, string LastName, string? Email, string? Phone, Role Role);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

public record UserDto(int Id, string Username, string FirstName, string LastName, string? Email, string? Phone, string Role, bool IsActive);

public record CreateStudentRequest(string Username, string Password, string FirstName, string LastName, string? Email, string? Phone, string AdmissionNumber, DateTime DateOfBirth, Gender Gender, string? Address, int? ClassId, int? ParentId);
public record UpdateStudentRequest(string? FirstName, string? LastName, string? Email, string? Phone, string? Address, int? ClassId, int? ParentId, bool? IsActive);

public record CreateTeacherRequest(string Username, string Password, string FirstName, string LastName, string? Email, string? Phone, string EmployeeId, string? Qualification);
public record UpdateTeacherRequest(string? FirstName, string? LastName, string? Email, string? Phone, string? Qualification, bool? IsActive);

public record CreateClassRequest(string Name, string? Section, int Capacity, int? TeacherId);
public record UpdateClassRequest(string? Name, string? Section, int? Capacity, int? TeacherId);

public record CreateSubjectRequest(string Name, string Code, string? Description);
public record UpdateSubjectRequest(string? Name, string? Code, string? Description);
public record AssignTeacherRequest(int TeacherId);
public record AssignClassRequest(int ClassId);

public record BulkAttendanceRequest(int ClassId, DateTime Date, List<AttendanceRecord> Records);
public record AttendanceRecord(int StudentId, AttendanceStatus Status);

public record CreateGradeRequest(int StudentId, int SubjectId, double Score, double MaxScore, string ExamType, string Term, string AcademicYear);
public record BulkGradeRequest(List<CreateGradeRequest> Grades);
public record UpdateGradeRequest(double? Score, double? MaxScore, string? ExamType);

public record CreateTimetableRequest(int ClassId, int SubjectId, int TeacherId, string Day, string StartTime, string EndTime, string? Room);
public record UpdateTimetableRequest(int? SubjectId, int? TeacherId, string? Day, string? StartTime, string? EndTime, string? Room);

public record CreateFeeStructureRequest(string Name, double Amount, int ClassId, string Term, string AcademicYear, DateTime DueDate);
public record CreatePaymentRequest(int StudentId, int FeeStructureId, double AmountPaid, string? PaymentMethod, string? ReceiptNumber);

public record CreateBookRequest(string Title, string Author, string? ISBN, string? Category, int Quantity);
public record UpdateBookRequest(string? Title, string? Author, string? ISBN, string? Category, int? Quantity, int? Available);
public record IssueBookRequest(int BookId, int StudentId, DateTime DueDate);

public record SendNotificationRequest(string Title, string Message, int RecipientId);
public record BulkNotificationRequest(string Title, string Message, List<int> RecipientIds);

public record CreateAnnouncementRequest(string Title, string Content, string? Audience, DateTime? ExpiresAt);
public record UpdateAnnouncementRequest(string? Title, string? Content, string? Audience, bool? IsActive, DateTime? ExpiresAt);
