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
public class SubjectsController : ControllerBase
{
    private readonly SchoolDbContext _db;
    public SubjectsController(SchoolDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var subjects = await _db.Subjects
            .Include(s => s.SubjectTeachers).ThenInclude(st => st.Teacher).ThenInclude(t => t.User)
            .Select(s => new
            {
                s.Id, s.Name, s.Code, s.Description,
                Teachers = s.SubjectTeachers.Select(st => new { Teacher = new { st.Teacher.Id, User = new { st.Teacher.User.FirstName, st.Teacher.User.LastName } } }),
                _count = new { classes = s.ClassSubjects.Count }
            })
            .ToListAsync();
        return Ok(subjects);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Create([FromBody] CreateSubjectRequest request)
    {
        var subject = new Subject { Name = request.Name, Code = request.Code, Description = request.Description };
        _db.Subjects.Add(subject);
        await _db.SaveChangesAsync();
        return Ok(new { subject.Id, message = "Subject created successfully" });
    }

    [HttpPost("{id}/teachers")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> AssignTeacher(int id, [FromBody] AssignTeacherRequest request)
    {
        _db.SubjectTeachers.Add(new SubjectTeacher { SubjectId = id, TeacherId = request.TeacherId });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Teacher assigned successfully" });
    }

    [HttpPost("{id}/classes")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> AssignClass(int id, [FromBody] AssignClassRequest request)
    {
        _db.ClassSubjects.Add(new ClassSubject { SubjectId = id, ClassId = request.ClassId });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Class assigned successfully" });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSubjectRequest request)
    {
        var subject = await _db.Subjects.FindAsync(id);
        if (subject == null) return NotFound();
        if (request.Name != null) subject.Name = request.Name;
        if (request.Code != null) subject.Code = request.Code;
        if (request.Description != null) subject.Description = request.Description;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Subject updated successfully" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Delete(int id)
    {
        var subject = await _db.Subjects.FindAsync(id);
        if (subject == null) return NotFound();
        _db.Subjects.Remove(subject);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Subject deleted successfully" });
    }
}
