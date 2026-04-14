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
public class ClassesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ClassesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<ClassResponseDto>>> GetAll([FromQuery] string? academicYear)
    {
        var query = _context.Classes
            .Include(c => c.ClassTeacher)
            .Include(c => c.Students)
            .AsQueryable();

        if (!string.IsNullOrEmpty(academicYear))
            query = query.Where(c => c.AcademicYear == academicYear);

        var classes = await query.Select(c => new ClassResponseDto(
            c.Id, c.Name, c.Section, c.AcademicYear,
            c.ClassTeacher != null ? c.ClassTeacher.FirstName + " " + c.ClassTeacher.LastName : null,
            c.Students.Count
        )).ToListAsync();

        return Ok(classes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ClassResponseDto>> GetById(int id)
    {
        var c = await _context.Classes
            .Include(c => c.ClassTeacher)
            .Include(c => c.Students)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (c == null) return NotFound();

        return Ok(new ClassResponseDto(
            c.Id, c.Name, c.Section, c.AcademicYear,
            c.ClassTeacher != null ? c.ClassTeacher.FirstName + " " + c.ClassTeacher.LastName : null,
            c.Students.Count));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ClassResponseDto>> Create(ClassCreateDto dto)
    {
        var schoolClass = new SchoolClass
        {
            Name = dto.Name,
            Section = dto.Section,
            AcademicYear = dto.AcademicYear,
            TeacherId = dto.TeacherId
        };

        _context.Classes.Add(schoolClass);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = schoolClass.Id },
            new ClassResponseDto(schoolClass.Id, schoolClass.Name, schoolClass.Section,
                schoolClass.AcademicYear, null, 0));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, ClassCreateDto dto)
    {
        var schoolClass = await _context.Classes.FindAsync(id);
        if (schoolClass == null) return NotFound();

        schoolClass.Name = dto.Name;
        schoolClass.Section = dto.Section;
        schoolClass.AcademicYear = dto.AcademicYear;
        schoolClass.TeacherId = dto.TeacherId;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var schoolClass = await _context.Classes.FindAsync(id);
        if (schoolClass == null) return NotFound();

        _context.Classes.Remove(schoolClass);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
