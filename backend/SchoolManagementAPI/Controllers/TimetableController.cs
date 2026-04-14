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
public class TimetableController : ControllerBase
{
    private readonly SchoolDbContext _db;
    public TimetableController(SchoolDbContext db) => _db = db;

    [HttpGet("class/{classId}")]
    public async Task<IActionResult> GetByClass(int classId)
    {
        var slots = await _db.TimetableSlots
            .Include(t => t.Subject)
            .Include(t => t.Teacher).ThenInclude(t => t.User)
            .Where(t => t.ClassId == classId)
            .OrderBy(t => t.Day).ThenBy(t => t.StartTime)
            .Select(t => new
            {
                t.Id, t.Day, t.StartTime, t.EndTime, t.Room, t.ClassId, t.SubjectId, t.TeacherId,
                Subject = new { t.Subject.Id, t.Subject.Name },
                Teacher = new { t.Teacher.Id, User = new { t.Teacher.User.FirstName, t.Teacher.User.LastName } }
            })
            .ToListAsync();
        return Ok(slots);
    }

    [HttpGet("teacher/{teacherId}")]
    public async Task<IActionResult> GetByTeacher(int teacherId)
    {
        var slots = await _db.TimetableSlots
            .Include(t => t.Subject)
            .Include(t => t.Class)
            .Where(t => t.TeacherId == teacherId)
            .OrderBy(t => t.Day).ThenBy(t => t.StartTime)
            .Select(t => new
            {
                t.Id, t.Day, t.StartTime, t.EndTime, t.Room,
                Subject = new { t.Subject.Id, t.Subject.Name },
                Class = new { t.Class.Id, t.Class.Name, t.Class.Section }
            })
            .ToListAsync();
        return Ok(slots);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Create([FromBody] CreateTimetableRequest request)
    {
        var slot = new TimetableSlot
        {
            ClassId = request.ClassId, SubjectId = request.SubjectId, TeacherId = request.TeacherId,
            Day = request.Day, StartTime = request.StartTime, EndTime = request.EndTime, Room = request.Room
        };
        _db.TimetableSlots.Add(slot);
        await _db.SaveChangesAsync();
        return Ok(new { slot.Id, message = "Timetable slot created successfully" });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTimetableRequest request)
    {
        var slot = await _db.TimetableSlots.FindAsync(id);
        if (slot == null) return NotFound();
        if (request.SubjectId.HasValue) slot.SubjectId = request.SubjectId.Value;
        if (request.TeacherId.HasValue) slot.TeacherId = request.TeacherId.Value;
        if (request.Day != null) slot.Day = request.Day;
        if (request.StartTime != null) slot.StartTime = request.StartTime;
        if (request.EndTime != null) slot.EndTime = request.EndTime;
        if (request.Room != null) slot.Room = request.Room;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Timetable slot updated successfully" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Delete(int id)
    {
        var slot = await _db.TimetableSlots.FindAsync(id);
        if (slot == null) return NotFound();
        _db.TimetableSlots.Remove(slot);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Timetable slot deleted successfully" });
    }
}
