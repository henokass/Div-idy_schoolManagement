using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly SchoolDbContext _db;
    public AttendanceController(SchoolDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? classId, [FromQuery] DateTime? date, [FromQuery] int? studentId)
    {
        var query = _db.Attendances.Include(a => a.Student).ThenInclude(s => s.User).AsQueryable();
        if (classId.HasValue) query = query.Where(a => a.ClassId == classId.Value);
        if (date.HasValue) query = query.Where(a => a.Date.Date == date.Value.Date);
        if (studentId.HasValue) query = query.Where(a => a.StudentId == studentId.Value);

        var records = await query.Select(a => new
        {
            a.Id, a.Date, Status = a.Status.ToString(), a.StudentId, a.ClassId,
            Student = new { User = new { a.Student.User.FirstName, a.Student.User.LastName } }
        }).ToListAsync();
        return Ok(records);
    }

    [HttpPost("bulk")]
    [Authorize(Roles = "ADMIN,TEACHER")]
    public async Task<IActionResult> BulkRecord([FromBody] BulkAttendanceRequest request)
    {
        // Remove existing records for this class and date
        var existing = await _db.Attendances
            .Where(a => a.ClassId == request.ClassId && a.Date.Date == request.Date.Date)
            .ToListAsync();
        _db.Attendances.RemoveRange(existing);

        var records = request.Records.Select(r => new Attendance
        {
            StudentId = r.StudentId, ClassId = request.ClassId, Date = request.Date, Status = r.Status
        });
        _db.Attendances.AddRange(records);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Attendance recorded successfully", count = request.Records.Count });
    }

    [HttpGet("student/{studentId}")]
    public async Task<IActionResult> GetStudentAttendance(int studentId, [FromQuery] string? term)
    {
        var records = await _db.Attendances
            .Where(a => a.StudentId == studentId)
            .ToListAsync();

        var total = records.Count;
        var present = records.Count(r => r.Status == AttendanceStatus.PRESENT);
        var absent = records.Count(r => r.Status == AttendanceStatus.ABSENT);
        var late = records.Count(r => r.Status == AttendanceStatus.LATE);
        var excused = records.Count(r => r.Status == AttendanceStatus.EXCUSED);

        return Ok(new
        {
            studentId, total, present, absent, late, excused,
            attendanceRate = total > 0 ? Math.Round((double)(present + late) / total * 100, 1) : 0,
            records = records.Select(r => new { r.Id, r.Date, Status = r.Status.ToString() })
        });
    }

    [HttpGet("class/{classId}")]
    public async Task<IActionResult> GetClassAttendance(int classId, [FromQuery] DateTime? date)
    {
        var targetDate = date ?? DateTime.UtcNow.Date;
        var records = await _db.Attendances
            .Include(a => a.Student).ThenInclude(s => s.User)
            .Where(a => a.ClassId == classId && a.Date.Date == targetDate.Date)
            .Select(a => new
            {
                a.Id, a.Date, Status = a.Status.ToString(), a.StudentId,
                Student = new { User = new { a.Student.User.FirstName, a.Student.User.LastName } }
            })
            .ToListAsync();
        return Ok(records);
    }
}
