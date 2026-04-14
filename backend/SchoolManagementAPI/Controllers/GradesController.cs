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
public class GradesController : ControllerBase
{
    private readonly SchoolDbContext _db;
    public GradesController(SchoolDbContext db) => _db = db;

    private static string CalculateGrade(double score, double maxScore)
    {
        var pct = score / maxScore * 100;
        return pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "F";
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? studentId, [FromQuery] int? subjectId, [FromQuery] string? term)
    {
        var query = _db.Grades.Include(g => g.Student).ThenInclude(s => s.User).Include(g => g.Subject).AsQueryable();
        if (studentId.HasValue) query = query.Where(g => g.StudentId == studentId.Value);
        if (subjectId.HasValue) query = query.Where(g => g.SubjectId == subjectId.Value);
        if (!string.IsNullOrEmpty(term)) query = query.Where(g => g.Term == term);

        var grades = await query.Select(g => new
        {
            g.Id, g.Score, g.MaxScore, Grade = g.GradeLetter, g.ExamType, g.Term, g.AcademicYear,
            Student = new { g.Student.Id, User = new { g.Student.User.FirstName, g.Student.User.LastName } },
            Subject = new { g.Subject.Id, g.Subject.Name }
        }).ToListAsync();
        return Ok(grades);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN,TEACHER")]
    public async Task<IActionResult> Create([FromBody] CreateGradeRequest request)
    {
        var grade = new Grade
        {
            StudentId = request.StudentId, SubjectId = request.SubjectId,
            Score = request.Score, MaxScore = request.MaxScore,
            GradeLetter = CalculateGrade(request.Score, request.MaxScore),
            ExamType = request.ExamType, Term = request.Term, AcademicYear = request.AcademicYear
        };
        _db.Grades.Add(grade);
        await _db.SaveChangesAsync();
        return Ok(new { grade.Id, message = "Grade recorded successfully" });
    }

    [HttpPost("bulk")]
    [Authorize(Roles = "ADMIN,TEACHER")]
    public async Task<IActionResult> BulkCreate([FromBody] BulkGradeRequest request)
    {
        var grades = request.Grades.Select(g => new Grade
        {
            StudentId = g.StudentId, SubjectId = g.SubjectId,
            Score = g.Score, MaxScore = g.MaxScore,
            GradeLetter = CalculateGrade(g.Score, g.MaxScore),
            ExamType = g.ExamType, Term = g.Term, AcademicYear = g.AcademicYear
        });
        _db.Grades.AddRange(grades);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Grades recorded successfully", count = request.Grades.Count });
    }

    [HttpGet("report-card/{studentId}")]
    public async Task<IActionResult> GetReportCard(int studentId, [FromQuery] string? term, [FromQuery] string? academicYear)
    {
        var student = await _db.Students.Include(s => s.User).Include(s => s.Class).FirstOrDefaultAsync(s => s.Id == studentId);
        if (student == null) return NotFound();

        var query = _db.Grades.Where(g => g.StudentId == studentId);
        if (!string.IsNullOrEmpty(term)) query = query.Where(g => g.Term == term);
        if (!string.IsNullOrEmpty(academicYear)) query = query.Where(g => g.AcademicYear == academicYear);

        var grades = await query.Include(g => g.Subject).ToListAsync();
        var avgScore = grades.Count > 0 ? Math.Round(grades.Average(g => g.Score / g.MaxScore * 100), 1) : 0;

        return Ok(new
        {
            Student = new { student.Id, student.User.FirstName, student.User.LastName, Class = student.Class?.Name },
            Grades = grades.Select(g => new { g.Subject.Name, g.Score, g.MaxScore, g.GradeLetter, g.ExamType }),
            Summary = new { TotalSubjects = grades.Select(g => g.SubjectId).Distinct().Count(), AverageScore = avgScore, OverallGrade = CalculateGrade(avgScore, 100) }
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN,TEACHER")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateGradeRequest request)
    {
        var grade = await _db.Grades.FindAsync(id);
        if (grade == null) return NotFound();
        if (request.Score.HasValue) { grade.Score = request.Score.Value; grade.GradeLetter = CalculateGrade(grade.Score, grade.MaxScore); }
        if (request.MaxScore.HasValue) { grade.MaxScore = request.MaxScore.Value; grade.GradeLetter = CalculateGrade(grade.Score, grade.MaxScore); }
        if (request.ExamType != null) grade.ExamType = request.ExamType;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Grade updated successfully" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN,TEACHER")]
    public async Task<IActionResult> Delete(int id)
    {
        var grade = await _db.Grades.FindAsync(id);
        if (grade == null) return NotFound();
        _db.Grades.Remove(grade);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Grade deleted successfully" });
    }
}
