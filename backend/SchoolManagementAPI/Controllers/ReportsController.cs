using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly SchoolDbContext _db;
    public ReportsController(SchoolDbContext db) => _db = db;

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview()
    {
        var classes = await _db.Classes.Select(c => new { c.Name, c.Section, Students = c.Students.Count }).ToListAsync();
        return Ok(new
        {
            TotalStudents = await _db.Students.CountAsync(),
            TotalTeachers = await _db.Teachers.CountAsync(),
            TotalClasses = await _db.Classes.CountAsync(),
            TotalSubjects = await _db.Subjects.CountAsync(),
            ClassDistribution = classes.Select(c => new { c.Name, c.Section, c.Students })
        });
    }

    [HttpGet("academic/class/{classId}")]
    [Authorize(Roles = "ADMIN,TEACHER")]
    public async Task<IActionResult> GetClassReport(int classId, [FromQuery] string? term, [FromQuery] string? academicYear)
    {
        var students = await _db.Students.Include(s => s.User).Where(s => s.ClassId == classId).ToListAsync();
        var report = new List<object>();

        foreach (var student in students)
        {
            var query = _db.Grades.Where(g => g.StudentId == student.Id);
            if (!string.IsNullOrEmpty(term)) query = query.Where(g => g.Term == term);
            if (!string.IsNullOrEmpty(academicYear)) query = query.Where(g => g.AcademicYear == academicYear);
            var grades = await query.ToListAsync();

            var avg = grades.Count > 0 ? Math.Round(grades.Average(g => g.Score / g.MaxScore * 100), 1) : 0;
            report.Add(new { student.Id, student.User.FirstName, student.User.LastName, AverageScore = avg, TotalExams = grades.Count });
        }

        return Ok(report.OrderByDescending(r => ((dynamic)r).AverageScore));
    }

    [HttpGet("attendance")]
    [Authorize(Roles = "ADMIN,TEACHER")]
    public async Task<IActionResult> GetAttendanceReport([FromQuery] int? classId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var query = _db.Attendances.AsQueryable();
        if (classId.HasValue) query = query.Where(a => a.ClassId == classId.Value);
        if (startDate.HasValue) query = query.Where(a => a.Date >= startDate.Value);
        if (endDate.HasValue) query = query.Where(a => a.Date <= endDate.Value);

        var records = await query.ToListAsync();
        var total = records.Count;
        return Ok(new
        {
            Total = total,
            Present = records.Count(r => r.Status == AttendanceStatus.PRESENT),
            Absent = records.Count(r => r.Status == AttendanceStatus.ABSENT),
            Late = records.Count(r => r.Status == AttendanceStatus.LATE),
            Excused = records.Count(r => r.Status == AttendanceStatus.EXCUSED),
            AttendanceRate = total > 0 ? Math.Round((double)records.Count(r => r.Status == AttendanceStatus.PRESENT || r.Status == AttendanceStatus.LATE) / total * 100, 1) : 0
        });
    }

    [HttpGet("fees")]
    [Authorize(Roles = "ADMIN,ACCOUNTANT")]
    public async Task<IActionResult> GetFeesReport()
    {
        var totalExpected = await _db.FeeStructures.Include(f => f.Class).ThenInclude(c => c.Students)
            .SumAsync(f => f.Amount * f.Class.Students.Count);
        var totalCollected = await _db.FeePayments.SumAsync(p => p.AmountPaid);
        return Ok(new { TotalExpected = totalExpected, TotalCollected = totalCollected, Outstanding = totalExpected - totalCollected, CollectionRate = totalExpected > 0 ? Math.Round(totalCollected / totalExpected * 100, 1) : 0 });
    }
}
