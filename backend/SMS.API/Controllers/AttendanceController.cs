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
public class AttendanceController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AttendanceController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<AttendanceResponseDto>>> GetAll(
        [FromQuery] int? classId, [FromQuery] DateTime? date, [FromQuery] int? studentId)
    {
        var query = _context.Attendances
            .Include(a => a.Student)
            .AsQueryable();

        if (studentId.HasValue)
            query = query.Where(a => a.StudentId == studentId);

        if (classId.HasValue)
            query = query.Where(a => a.Student.ClassId == classId);

        if (date.HasValue)
            query = query.Where(a => a.Date.Date == date.Value.Date);

        var attendance = await query.Select(a => new AttendanceResponseDto(
            a.Id, a.StudentId,
            a.Student.FirstName + " " + a.Student.LastName,
            a.Date, a.Status, a.Remarks
        )).OrderByDescending(a => a.Date).ToListAsync();

        return Ok(attendance);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<AttendanceResponseDto>> Create(AttendanceCreateDto dto)
    {
        var student = await _context.Students.FindAsync(dto.StudentId);
        if (student == null) return BadRequest(new { message = "Student not found" });

        var attendance = new Attendance
        {
            StudentId = dto.StudentId,
            Date = dto.Date,
            Status = dto.Status,
            Remarks = dto.Remarks
        };

        _context.Attendances.Add(attendance);
        await _context.SaveChangesAsync();

        return Ok(new AttendanceResponseDto(
            attendance.Id, attendance.StudentId,
            student.FirstName + " " + student.LastName,
            attendance.Date, attendance.Status, attendance.Remarks));
    }

    [HttpPost("bulk")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> BulkCreate(AttendanceBulkCreateDto dto)
    {
        var attendances = dto.Entries.Select(e => new Attendance
        {
            StudentId = e.StudentId,
            Date = dto.Date,
            Status = e.Status,
            Remarks = e.Remarks
        }).ToList();

        _context.Attendances.AddRange(attendances);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Attendance recorded for {attendances.Count} students" });
    }

    [HttpGet("report")]
    public async Task<ActionResult<List<AttendanceSummaryDto>>> GetReport(
        [FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int? classId)
    {
        var query = _context.Attendances
            .Include(a => a.Student)
            .Where(a => a.Date >= startDate && a.Date <= endDate);

        if (classId.HasValue)
            query = query.Where(a => a.Student.ClassId == classId);

        var report = await query
            .GroupBy(a => a.Date.Date)
            .Select(g => new AttendanceSummaryDto(
                g.Key,
                g.Count(a => a.Status == AttendanceStatus.Present),
                g.Count(a => a.Status == AttendanceStatus.Absent),
                g.Count(a => a.Status == AttendanceStatus.Late)
            )).OrderByDescending(r => r.Date).ToListAsync();

        return Ok(report);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Delete(int id)
    {
        var attendance = await _context.Attendances.FindAsync(id);
        if (attendance == null) return NotFound();

        _context.Attendances.Remove(attendance);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
