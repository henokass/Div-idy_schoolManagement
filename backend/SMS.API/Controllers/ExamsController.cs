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
public class ExamsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ExamsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<ExamResponseDto>>> GetAll([FromQuery] string? academicYear)
    {
        var query = _context.Exams.AsQueryable();

        if (!string.IsNullOrEmpty(academicYear))
            query = query.Where(e => e.AcademicYear == academicYear);

        var exams = await query.Select(e => new ExamResponseDto(
            e.Id, e.Name, e.ExamType, e.StartDate, e.EndDate, e.AcademicYear
        )).ToListAsync();

        return Ok(exams);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExamResponseDto>> GetById(int id)
    {
        var e = await _context.Exams.FindAsync(id);
        if (e == null) return NotFound();

        return Ok(new ExamResponseDto(e.Id, e.Name, e.ExamType, e.StartDate, e.EndDate, e.AcademicYear));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ExamResponseDto>> Create(ExamCreateDto dto)
    {
        var exam = new Exam
        {
            Name = dto.Name,
            ExamType = dto.ExamType,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            AcademicYear = dto.AcademicYear
        };

        _context.Exams.Add(exam);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = exam.Id },
            new ExamResponseDto(exam.Id, exam.Name, exam.ExamType, exam.StartDate, exam.EndDate, exam.AcademicYear));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, ExamCreateDto dto)
    {
        var exam = await _context.Exams.FindAsync(id);
        if (exam == null) return NotFound();

        exam.Name = dto.Name;
        exam.ExamType = dto.ExamType;
        exam.StartDate = dto.StartDate;
        exam.EndDate = dto.EndDate;
        exam.AcademicYear = dto.AcademicYear;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var exam = await _context.Exams.FindAsync(id);
        if (exam == null) return NotFound();

        _context.Exams.Remove(exam);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
