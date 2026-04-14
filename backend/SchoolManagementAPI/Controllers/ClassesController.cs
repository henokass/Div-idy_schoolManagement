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
public class ClassesController : ControllerBase
{
    private readonly SchoolDbContext _db;
    public ClassesController(SchoolDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var classes = await _db.Classes
            .Include(c => c.Teacher).ThenInclude(t => t!.User)
            .Select(c => new
            {
                c.Id, c.Name, c.Section, c.Capacity,
                Teacher = c.Teacher == null ? null : new { c.Teacher.Id, User = new { c.Teacher.User.FirstName, c.Teacher.User.LastName } },
                _count = new { students = c.Students.Count }
            })
            .ToListAsync();
        return Ok(classes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var cls = await _db.Classes
            .Include(c => c.Teacher).ThenInclude(t => t!.User)
            .Include(c => c.Students).ThenInclude(s => s.User)
            .Include(c => c.ClassSubjects).ThenInclude(cs => cs.Subject)
            .Include(c => c.TimetableSlots).ThenInclude(ts => ts.Subject)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (cls == null) return NotFound();
        return Ok(new
        {
            cls.Id, cls.Name, cls.Section, cls.Capacity,
            Teacher = cls.Teacher == null ? null : new { cls.Teacher.Id, User = new { cls.Teacher.User.FirstName, cls.Teacher.User.LastName } },
            Students = cls.Students.Select(s => new { s.Id, User = new { s.User.FirstName, s.User.LastName } }),
            Subjects = cls.ClassSubjects.Select(cs => new { cs.Subject.Id, cs.Subject.Name, cs.Subject.Code })
        });
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Create([FromBody] CreateClassRequest request)
    {
        var cls = new Class { Name = request.Name, Section = request.Section, Capacity = request.Capacity, TeacherId = request.TeacherId };
        _db.Classes.Add(cls);
        await _db.SaveChangesAsync();
        return Ok(new { cls.Id, message = "Class created successfully" });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateClassRequest request)
    {
        var cls = await _db.Classes.FindAsync(id);
        if (cls == null) return NotFound();
        if (request.Name != null) cls.Name = request.Name;
        if (request.Section != null) cls.Section = request.Section;
        if (request.Capacity.HasValue) cls.Capacity = request.Capacity.Value;
        if (request.TeacherId.HasValue) cls.TeacherId = request.TeacherId;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Class updated successfully" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Delete(int id)
    {
        var cls = await _db.Classes.FindAsync(id);
        if (cls == null) return NotFound();
        _db.Classes.Remove(cls);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Class deleted successfully" });
    }
}
