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
public class TeachersController : ControllerBase
{
    private readonly SchoolDbContext _db;
    public TeachersController(SchoolDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> GetAll()
    {
        var teachers = await _db.Teachers
            .Include(t => t.User)
            .Include(t => t.SubjectTeachers).ThenInclude(st => st.Subject)
            .Include(t => t.Classes)
            .Select(t => new
            {
                t.Id, t.EmployeeId, t.Qualification, t.JoinDate, t.IsActive,
                User = new { t.User.Id, t.User.FirstName, t.User.LastName, t.User.Email, t.User.Phone },
                Subjects = t.SubjectTeachers.Select(st => new { st.Subject.Id, st.Subject.Name, st.Subject.Code }),
                Classes = t.Classes.Select(c => new { c.Id, c.Name, c.Section })
            })
            .ToListAsync();
        return Ok(teachers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var teacher = await _db.Teachers
            .Include(t => t.User)
            .Include(t => t.SubjectTeachers).ThenInclude(st => st.Subject)
            .Include(t => t.Classes)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (teacher == null) return NotFound();
        return Ok(new
        {
            teacher.Id, teacher.EmployeeId, teacher.Qualification, teacher.JoinDate, teacher.IsActive,
            User = new { teacher.User.Id, teacher.User.FirstName, teacher.User.LastName, teacher.User.Email, teacher.User.Phone },
            Subjects = teacher.SubjectTeachers.Select(st => new { st.Subject.Id, st.Subject.Name, st.Subject.Code }),
            Classes = teacher.Classes.Select(c => new { c.Id, c.Name, c.Section })
        });
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Create([FromBody] CreateTeacherRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Username == request.Username))
            return BadRequest(new { error = "Username already exists" });

        var user = new User
        {
            Username = request.Username, PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName, LastName = request.LastName,
            Email = request.Email, Phone = request.Phone, Role = Role.TEACHER
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var teacher = new Teacher { UserId = user.Id, EmployeeId = request.EmployeeId, Qualification = request.Qualification };
        _db.Teachers.Add(teacher);
        await _db.SaveChangesAsync();
        return Ok(new { teacher.Id, message = "Teacher created successfully" });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTeacherRequest request)
    {
        var teacher = await _db.Teachers.Include(t => t.User).FirstOrDefaultAsync(t => t.Id == id);
        if (teacher == null) return NotFound();

        if (request.FirstName != null) teacher.User.FirstName = request.FirstName;
        if (request.LastName != null) teacher.User.LastName = request.LastName;
        if (request.Email != null) teacher.User.Email = request.Email;
        if (request.Phone != null) teacher.User.Phone = request.Phone;
        if (request.Qualification != null) teacher.Qualification = request.Qualification;
        if (request.IsActive.HasValue) teacher.IsActive = request.IsActive.Value;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Teacher updated successfully" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Delete(int id)
    {
        var teacher = await _db.Teachers.Include(t => t.User).FirstOrDefaultAsync(t => t.Id == id);
        if (teacher == null) return NotFound();
        _db.Users.Remove(teacher.User);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Teacher deleted successfully" });
    }
}
