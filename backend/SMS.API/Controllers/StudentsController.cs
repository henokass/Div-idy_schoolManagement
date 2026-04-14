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
public class StudentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public StudentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<StudentResponseDto>>> GetAll([FromQuery] string? search, [FromQuery] int? classId)
    {
        var query = _context.Students
            .Include(s => s.Class)
            .Include(s => s.Parent)
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
            query = query.Where(s => s.FirstName.Contains(search) || s.LastName.Contains(search) || s.StudentIdNumber.Contains(search));

        if (classId.HasValue)
            query = query.Where(s => s.ClassId == classId);

        var students = await query.Select(s => new StudentResponseDto(
            s.Id, s.StudentIdNumber, s.FirstName, s.LastName,
            s.DateOfBirth, s.Gender, s.Address, s.PhoneNumber,
            s.Email, s.EnrollmentDate, s.IsActive,
            s.Class != null ? s.Class.Name + " " + s.Class.Section : null,
            s.Parent != null ? s.Parent.FirstName + " " + s.Parent.LastName : null
        )).ToListAsync();

        return Ok(students);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StudentResponseDto>> GetById(int id)
    {
        var s = await _context.Students
            .Include(s => s.Class)
            .Include(s => s.Parent)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (s == null) return NotFound();

        return Ok(new StudentResponseDto(
            s.Id, s.StudentIdNumber, s.FirstName, s.LastName,
            s.DateOfBirth, s.Gender, s.Address, s.PhoneNumber,
            s.Email, s.EnrollmentDate, s.IsActive,
            s.Class != null ? s.Class.Name + " " + s.Class.Section : null,
            s.Parent != null ? s.Parent.FirstName + " " + s.Parent.LastName : null
        ));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<StudentResponseDto>> Create(StudentCreateDto dto)
    {
        if (await _context.Students.AnyAsync(s => s.StudentIdNumber == dto.StudentIdNumber))
            return BadRequest(new { message = "Student ID already exists" });

        var student = new Student
        {
            StudentIdNumber = dto.StudentIdNumber,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            Address = dto.Address,
            PhoneNumber = dto.PhoneNumber,
            Email = dto.Email,
            ClassId = dto.ClassId,
            ParentId = dto.ParentId
        };

        _context.Students.Add(student);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = student.Id },
            new StudentResponseDto(student.Id, student.StudentIdNumber, student.FirstName, student.LastName,
                student.DateOfBirth, student.Gender, student.Address, student.PhoneNumber,
                student.Email, student.EnrollmentDate, student.IsActive, null, null));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, StudentUpdateDto dto)
    {
        var student = await _context.Students.FindAsync(id);
        if (student == null) return NotFound();

        student.FirstName = dto.FirstName;
        student.LastName = dto.LastName;
        student.DateOfBirth = dto.DateOfBirth;
        student.Gender = dto.Gender;
        student.Address = dto.Address;
        student.PhoneNumber = dto.PhoneNumber;
        student.Email = dto.Email;
        student.ClassId = dto.ClassId;
        student.ParentId = dto.ParentId;
        student.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var student = await _context.Students.FindAsync(id);
        if (student == null) return NotFound();

        _context.Students.Remove(student);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
