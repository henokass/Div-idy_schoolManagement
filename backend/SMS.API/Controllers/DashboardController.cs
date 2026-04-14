using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS.API.Data;
using SMS.API.DTOs;
using SMS.API.Models;

namespace SMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardDto>> GetDashboard()
    {
        var totalStudents = await _context.Students.CountAsync(s => s.IsActive);
        var totalStaff = await _context.Staff.CountAsync(s => s.IsActive);
        var totalClasses = await _context.Classes.CountAsync();
        var totalSubjects = await _context.Subjects.CountAsync();
        var booksInLibrary = await _context.LibraryBooks.SumAsync(b => b.TotalCopies);

        var totalFeesCollected = await _context.FeePayments
            .Where(f => f.Status == PaymentStatus.Completed)
            .SumAsync(f => (decimal?)f.AmountPaid) ?? 0;

        var totalFeesPending = await _context.FeePayments
            .Where(f => f.Status == PaymentStatus.Pending)
            .SumAsync(f => (decimal?)f.AmountPaid) ?? 0;

        var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
        var recentAttendance = await _context.Attendances
            .Where(a => a.Date >= sevenDaysAgo)
            .GroupBy(a => a.Date.Date)
            .Select(g => new AttendanceSummaryDto(
                g.Key,
                g.Count(a => a.Status == AttendanceStatus.Present),
                g.Count(a => a.Status == AttendanceStatus.Absent),
                g.Count(a => a.Status == AttendanceStatus.Late)
            )).OrderByDescending(a => a.Date).ToListAsync();

        return Ok(new DashboardDto(
            totalStudents, totalStaff, totalClasses, totalSubjects,
            totalFeesCollected, totalFeesPending, booksInLibrary,
            recentAttendance));
    }

    [HttpGet("teacher/{teacherId}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> GetTeacherDashboard(int teacherId)
    {
        var classes = await _context.Classes
            .Where(c => c.TeacherId == teacherId)
            .Select(c => new { c.Id, c.Name, c.Section, StudentCount = c.Students.Count })
            .ToListAsync();

        var subjects = await _context.Subjects
            .Where(s => s.TeacherId == teacherId)
            .Select(s => new { s.Id, s.Name, s.Code })
            .ToListAsync();

        return Ok(new { Classes = classes, Subjects = subjects });
    }

    [HttpGet("student/{studentId}")]
    [Authorize(Roles = "Admin,Student,Parent")]
    public async Task<IActionResult> GetStudentDashboard(int studentId)
    {
        var student = await _context.Students
            .Include(s => s.Class)
            .FirstOrDefaultAsync(s => s.Id == studentId);

        if (student == null) return NotFound();

        var attendanceSummary = await _context.Attendances
            .Where(a => a.StudentId == studentId)
            .GroupBy(a => a.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToListAsync();

        var recentGrades = await _context.Grades
            .Include(g => g.Subject)
            .Include(g => g.Exam)
            .Where(g => g.StudentId == studentId)
            .OrderByDescending(g => g.Exam.StartDate)
            .Take(10)
            .Select(g => new
            {
                Subject = g.Subject.Name,
                Exam = g.Exam.Name,
                g.MarksObtained,
                g.MaxMarks,
                g.GradeLetter
            }).ToListAsync();

        var pendingFees = await _context.FeePayments
            .Where(f => f.StudentId == studentId && f.Status == PaymentStatus.Pending)
            .SumAsync(f => (decimal?)f.AmountPaid) ?? 0;

        return Ok(new
        {
            StudentName = student.FirstName + " " + student.LastName,
            Class = student.Class != null ? student.Class.Name + " " + student.Class.Section : "N/A",
            AttendanceSummary = attendanceSummary,
            RecentGrades = recentGrades,
            PendingFees = pendingFees
        });
    }
}
