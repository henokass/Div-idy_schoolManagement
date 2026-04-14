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
public class GradesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public GradesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<GradeResponseDto>>> GetAll(
        [FromQuery] int? studentId, [FromQuery] int? examId, [FromQuery] int? subjectId)
    {
        var query = _context.Grades
            .Include(g => g.Student)
            .Include(g => g.Subject)
            .Include(g => g.Exam)
            .AsQueryable();

        if (studentId.HasValue)
            query = query.Where(g => g.StudentId == studentId);
        if (examId.HasValue)
            query = query.Where(g => g.ExamId == examId);
        if (subjectId.HasValue)
            query = query.Where(g => g.SubjectId == subjectId);

        var grades = await query.Select(g => new GradeResponseDto(
            g.Id,
            g.Student.FirstName + " " + g.Student.LastName,
            g.Subject.Name,
            g.Exam.Name,
            g.MarksObtained, g.MaxMarks, g.GradeLetter, g.Remarks
        )).ToListAsync();

        return Ok(grades);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<GradeResponseDto>> Create(GradeCreateDto dto)
    {
        var grade = new Grade
        {
            StudentId = dto.StudentId,
            SubjectId = dto.SubjectId,
            ExamId = dto.ExamId,
            MarksObtained = dto.MarksObtained,
            MaxMarks = dto.MaxMarks,
            GradeLetter = dto.GradeLetter,
            Remarks = dto.Remarks
        };

        _context.Grades.Add(grade);
        await _context.SaveChangesAsync();

        var result = await _context.Grades
            .Include(g => g.Student)
            .Include(g => g.Subject)
            .Include(g => g.Exam)
            .FirstAsync(g => g.Id == grade.Id);

        return Ok(new GradeResponseDto(
            result.Id,
            result.Student.FirstName + " " + result.Student.LastName,
            result.Subject.Name,
            result.Exam.Name,
            result.MarksObtained, result.MaxMarks, result.GradeLetter, result.Remarks));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Update(int id, GradeCreateDto dto)
    {
        var grade = await _context.Grades.FindAsync(id);
        if (grade == null) return NotFound();

        grade.MarksObtained = dto.MarksObtained;
        grade.MaxMarks = dto.MaxMarks;
        grade.GradeLetter = dto.GradeLetter;
        grade.Remarks = dto.Remarks;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Delete(int id)
    {
        var grade = await _context.Grades.FindAsync(id);
        if (grade == null) return NotFound();

        _context.Grades.Remove(grade);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("report-card/{studentId}")]
    public async Task<IActionResult> GetReportCard(int studentId, [FromQuery] int? examId)
    {
        var student = await _context.Students
            .Include(s => s.Class)
            .FirstOrDefaultAsync(s => s.Id == studentId);

        if (student == null) return NotFound();

        var query = _context.Grades
            .Include(g => g.Subject)
            .Include(g => g.Exam)
            .Where(g => g.StudentId == studentId);

        if (examId.HasValue)
            query = query.Where(g => g.ExamId == examId);

        var grades = await query.Select(g => new
        {
            Subject = g.Subject.Name,
            Exam = g.Exam.Name,
            g.MarksObtained,
            g.MaxMarks,
            Percentage = g.MaxMarks > 0 ? Math.Round((g.MarksObtained / g.MaxMarks) * 100, 2) : 0,
            g.GradeLetter,
            g.Remarks
        }).ToListAsync();

        return Ok(new
        {
            StudentName = student.FirstName + " " + student.LastName,
            StudentId = student.StudentIdNumber,
            Class = student.Class != null ? student.Class.Name + " " + student.Class.Section : "N/A",
            Grades = grades,
            TotalMarks = grades.Sum(g => g.MarksObtained),
            MaxTotalMarks = grades.Sum(g => g.MaxMarks),
            OverallPercentage = grades.Sum(g => g.MaxMarks) > 0
                ? Math.Round((grades.Sum(g => g.MarksObtained) / grades.Sum(g => g.MaxMarks)) * 100, 2) : 0
        });
    }
}
