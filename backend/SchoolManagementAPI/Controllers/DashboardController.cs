using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;
using System.Security.Claims;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly SchoolDbContext _db;
    public DashboardController(SchoolDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var role = User.FindFirst(ClaimTypes.Role)!.Value;
        var announcements = await _db.Announcements.Where(a => a.IsActive).OrderByDescending(a => a.CreatedAt).Take(5).ToListAsync();

        if (role == "ADMIN")
        {
            return Ok(new
            {
                Stats = new
                {
                    Students = await _db.Students.CountAsync(),
                    Teachers = await _db.Teachers.CountAsync(),
                    Classes = await _db.Classes.CountAsync(),
                    Parents = await _db.Parents.CountAsync()
                },
                Announcements = announcements,
                RecentStudents = await _db.Students.Include(s => s.User).OrderByDescending(s => s.EnrollmentDate).Take(5)
                    .Select(s => new { s.Id, s.User.FirstName, s.User.LastName, s.AdmissionNumber }).ToListAsync()
            });
        }

        if (role == "TEACHER")
        {
            var teacher = await _db.Teachers.Include(t => t.Classes).ThenInclude(c => c.Students)
                .Include(t => t.SubjectTeachers).ThenInclude(st => st.Subject)
                .FirstOrDefaultAsync(t => t.UserId == userId);
            return Ok(new
            {
                Teacher = teacher == null ? null : new
                {
                    Classes = teacher.Classes.Select(c => new { c.Id, c.Name, c.Section, _count = new { students = c.Students.Count } }),
                    Subjects = teacher.SubjectTeachers.Select(st => new { Subject = new { st.Subject.Id, st.Subject.Name, st.Subject.Code } })
                },
                Announcements = announcements
            });
        }

        if (role == "STUDENT")
        {
            var student = await _db.Students.Include(s => s.Class).Include(s => s.Grades).ThenInclude(g => g.Subject)
                .FirstOrDefaultAsync(s => s.UserId == userId);
            return Ok(new
            {
                Student = student == null ? null : new
                {
                    Class = student.Class == null ? null : new { student.Class.Name, student.Class.Section },
                    Grades = student.Grades.OrderByDescending(g => g.CreatedAt).Take(5).Select(g => new { g.Id, Subject = new { g.Subject.Name }, g.Score, g.MaxScore, Grade = g.GradeLetter })
                },
                Announcements = announcements
            });
        }

        if (role == "PARENT")
        {
            var parent = await _db.Parents.Include(p => p.Students).ThenInclude(s => s.User)
                .Include(p => p.Students).ThenInclude(s => s.Class)
                .FirstOrDefaultAsync(p => p.UserId == userId);
            return Ok(new
            {
                Parent = parent == null ? null : new
                {
                    Students = parent.Students.Select(s => new { User = new { s.User.FirstName, s.User.LastName }, Class = s.Class == null ? null : new { s.Class.Name } })
                },
                Announcements = announcements
            });
        }

        if (role == "ACCOUNTANT")
        {
            return Ok(new
            {
                Stats = new
                {
                    TotalCollected = await _db.FeePayments.SumAsync(p => p.AmountPaid),
                    PendingPayments = await _db.FeePayments.CountAsync(p => p.Status != PaymentStatus.PAID)
                },
                RecentPayments = await _db.FeePayments.Include(p => p.Student).ThenInclude(s => s.User)
                    .OrderByDescending(p => p.PaymentDate).Take(5)
                    .Select(p => new { p.Id, p.AmountPaid, Student = new { User = new { p.Student.User.FirstName, p.Student.User.LastName } } }).ToListAsync(),
                Announcements = announcements
            });
        }

        return Ok(new { Announcements = announcements });
    }
}
