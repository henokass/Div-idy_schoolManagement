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
public class StudentsController : ControllerBase
{
    private readonly SchoolDbContext _db;

    public StudentsController(SchoolDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "ADMIN,TEACHER")]
    public async Task<IActionResult> GetAll()
    {
        var students = await _db.Students
            .Include(s => s.User)
            .Include(s => s.Class)
            .Include(s => s.Parent).ThenInclude(p => p!.User)
            .OrderBy(s => s.User.FirstName)
            .Select(s => new
            {
                s.Id, s.AdmissionNumber, s.DateOfBirth, Gender = s.Gender.ToString(),
                s.Address, s.EnrollmentDate, s.IsActive,
                User = new { s.User.Id, s.User.FirstName, s.User.LastName, s.User.Email, s.User.Phone },
                Class = s.Class == null ? null : new { s.Class.Id, s.Class.Name, s.Class.Section },
                Parent = s.Parent == null ? null : new { s.Parent.Id, User = new { s.Parent.User.FirstName, s.Parent.User.LastName } }
            })
            .ToListAsync();
        return Ok(students);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var student = await _db.Students
            .Include(s => s.User)
            .Include(s => s.Class)
            .Include(s => s.Parent).ThenInclude(p => p!.User)
            .Include(s => s.Grades).ThenInclude(g => g.Subject)
            .Include(s => s.Attendances)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (student == null) return NotFound();
        return Ok(new
        {
            student.Id, student.AdmissionNumber, student.DateOfBirth, Gender = student.Gender.ToString(),
            student.Address, student.EnrollmentDate, student.IsActive,
            User = new { student.User.Id, student.User.FirstName, student.User.LastName, student.User.Email, student.User.Phone },
            Class = student.Class == null ? null : new { student.Class.Id, student.Class.Name, student.Class.Section },
            Parent = student.Parent == null ? null : new { student.Parent.Id, User = new { student.Parent.User.FirstName, student.Parent.User.LastName } },
            Grades = student.Grades.Select(g => new { g.Id, g.Score, g.MaxScore, g.GradeLetter, g.ExamType, g.Term, g.AcademicYear, Subject = new { g.Subject.Id, g.Subject.Name } }),
            Attendances = student.Attendances.Select(a => new { a.Id, a.Date, Status = a.Status.ToString() })
        });
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Create([FromBody] CreateStudentRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Username == request.Username))
            return BadRequest(new { error = "Username already exists" });

        var user = new User
        {
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName, LastName = request.LastName,
            Email = request.Email, Phone = request.Phone, Role = Role.STUDENT
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var student = new Student
        {
            UserId = user.Id, AdmissionNumber = request.AdmissionNumber,
            DateOfBirth = request.DateOfBirth, Gender = request.Gender,
            Address = request.Address, ClassId = request.ClassId, ParentId = request.ParentId
        };
        _db.Students.Add(student);
        await _db.SaveChangesAsync();
        return Ok(new { student.Id, message = "Student created successfully" });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateStudentRequest request)
    {
        var student = await _db.Students.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id);
        if (student == null) return NotFound();

        if (request.FirstName != null) student.User.FirstName = request.FirstName;
        if (request.LastName != null) student.User.LastName = request.LastName;
        if (request.Email != null) student.User.Email = request.Email;
        if (request.Phone != null) student.User.Phone = request.Phone;
        if (request.Address != null) student.Address = request.Address;
        if (request.ClassId.HasValue) student.ClassId = request.ClassId;
        if (request.ParentId.HasValue) student.ParentId = request.ParentId;
        if (request.IsActive.HasValue) student.IsActive = request.IsActive.Value;

        student.User.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Student updated successfully" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Delete(int id)
    {
        var student = await _db.Students.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id);
        if (student == null) return NotFound();
        _db.Users.Remove(student.User);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Student deleted successfully" });
    }
}
