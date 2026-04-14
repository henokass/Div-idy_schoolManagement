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
public class SubjectsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SubjectsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<SubjectResponseDto>>> GetAll([FromQuery] int? classId)
    {
        var query = _context.Subjects
            .Include(s => s.Class)
            .Include(s => s.Teacher)
            .AsQueryable();

        if (classId.HasValue)
            query = query.Where(s => s.ClassId == classId);

        var subjects = await query.Select(s => new SubjectResponseDto(
            s.Id, s.Name, s.Code, s.Description,
            s.Class != null ? s.Class.Name + " " + s.Class.Section : null,
            s.Teacher != null ? s.Teacher.FirstName + " " + s.Teacher.LastName : null
        )).ToListAsync();

        return Ok(subjects);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SubjectResponseDto>> GetById(int id)
    {
        var s = await _context.Subjects
            .Include(s => s.Class)
            .Include(s => s.Teacher)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (s == null) return NotFound();

        return Ok(new SubjectResponseDto(
            s.Id, s.Name, s.Code, s.Description,
            s.Class != null ? s.Class.Name + " " + s.Class.Section : null,
            s.Teacher != null ? s.Teacher.FirstName + " " + s.Teacher.LastName : null));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SubjectResponseDto>> Create(SubjectCreateDto dto)
    {
        if (await _context.Subjects.AnyAsync(s => s.Code == dto.Code))
            return BadRequest(new { message = "Subject code already exists" });

        var subject = new Subject
        {
            Name = dto.Name,
            Code = dto.Code,
            Description = dto.Description,
            ClassId = dto.ClassId,
            TeacherId = dto.TeacherId
        };

        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = subject.Id },
            new SubjectResponseDto(subject.Id, subject.Name, subject.Code, subject.Description, null, null));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, SubjectCreateDto dto)
    {
        var subject = await _context.Subjects.FindAsync(id);
        if (subject == null) return NotFound();

        subject.Name = dto.Name;
        subject.Code = dto.Code;
        subject.Description = dto.Description;
        subject.ClassId = dto.ClassId;
        subject.TeacherId = dto.TeacherId;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var subject = await _context.Subjects.FindAsync(id);
        if (subject == null) return NotFound();

        _context.Subjects.Remove(subject);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
