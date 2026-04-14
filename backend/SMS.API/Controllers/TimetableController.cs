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
public class TimetableController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TimetableController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<TimetableResponseDto>>> GetAll([FromQuery] int? classId)
    {
        var query = _context.Timetables
            .Include(t => t.Class)
            .Include(t => t.Subject)
            .AsQueryable();

        if (classId.HasValue)
            query = query.Where(t => t.ClassId == classId);

        var timetables = await query
            .OrderBy(t => t.DayOfWeek)
            .ThenBy(t => t.StartTime)
            .Select(t => new TimetableResponseDto(
                t.Id, t.Class.Name + " " + t.Class.Section,
                t.Subject.Name, t.DayOfWeek, t.StartTime, t.EndTime
            )).ToListAsync();

        return Ok(timetables);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TimetableResponseDto>> Create(TimetableCreateDto dto)
    {
        var timetable = new Timetable
        {
            ClassId = dto.ClassId,
            SubjectId = dto.SubjectId,
            DayOfWeek = dto.DayOfWeek,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime
        };

        _context.Timetables.Add(timetable);
        await _context.SaveChangesAsync();

        var result = await _context.Timetables
            .Include(t => t.Class)
            .Include(t => t.Subject)
            .FirstAsync(t => t.Id == timetable.Id);

        return Ok(new TimetableResponseDto(
            result.Id, result.Class.Name + " " + result.Class.Section,
            result.Subject.Name, result.DayOfWeek, result.StartTime, result.EndTime));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, TimetableCreateDto dto)
    {
        var timetable = await _context.Timetables.FindAsync(id);
        if (timetable == null) return NotFound();

        timetable.ClassId = dto.ClassId;
        timetable.SubjectId = dto.SubjectId;
        timetable.DayOfWeek = dto.DayOfWeek;
        timetable.StartTime = dto.StartTime;
        timetable.EndTime = dto.EndTime;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var timetable = await _context.Timetables.FindAsync(id);
        if (timetable == null) return NotFound();

        _context.Timetables.Remove(timetable);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
