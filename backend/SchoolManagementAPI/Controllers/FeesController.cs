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
public class FeesController : ControllerBase
{
    private readonly SchoolDbContext _db;
    public FeesController(SchoolDbContext db) => _db = db;

    [HttpGet("structures")]
    public async Task<IActionResult> GetStructures([FromQuery] int? classId, [FromQuery] string? term)
    {
        var query = _db.FeeStructures.Include(f => f.Class).AsQueryable();
        if (classId.HasValue) query = query.Where(f => f.ClassId == classId.Value);
        if (!string.IsNullOrEmpty(term)) query = query.Where(f => f.Term == term);

        var structures = await query.Select(f => new
        {
            f.Id, f.Name, f.Amount, f.Term, f.AcademicYear, f.DueDate,
            Class = new { f.Class.Id, f.Class.Name, f.Class.Section }
        }).ToListAsync();
        return Ok(structures);
    }

    [HttpPost("structures")]
    [Authorize(Roles = "ADMIN,ACCOUNTANT")]
    public async Task<IActionResult> CreateStructure([FromBody] CreateFeeStructureRequest request)
    {
        var structure = new FeeStructure
        {
            Name = request.Name, Amount = request.Amount, ClassId = request.ClassId,
            Term = request.Term, AcademicYear = request.AcademicYear, DueDate = request.DueDate
        };
        _db.FeeStructures.Add(structure);
        await _db.SaveChangesAsync();
        return Ok(new { structure.Id, message = "Fee structure created successfully" });
    }

    [HttpGet("payments")]
    [Authorize(Roles = "ADMIN,ACCOUNTANT")]
    public async Task<IActionResult> GetPayments()
    {
        var payments = await _db.FeePayments
            .Include(p => p.Student).ThenInclude(s => s.User)
            .Include(p => p.FeeStructure)
            .Select(p => new
            {
                p.Id, p.AmountPaid, p.PaymentDate, p.PaymentMethod, p.ReceiptNumber, Status = p.Status.ToString(),
                Student = new { p.Student.Id, User = new { p.Student.User.FirstName, p.Student.User.LastName } },
                FeeStructure = new { p.FeeStructure.Id, p.FeeStructure.Name, p.FeeStructure.Amount }
            })
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync();
        return Ok(payments);
    }

    [HttpPost("payments")]
    [Authorize(Roles = "ADMIN,ACCOUNTANT")]
    public async Task<IActionResult> RecordPayment([FromBody] CreatePaymentRequest request)
    {
        var feeStructure = await _db.FeeStructures.FindAsync(request.FeeStructureId);
        if (feeStructure == null) return NotFound(new { error = "Fee structure not found" });

        var totalPaid = await _db.FeePayments
            .Where(p => p.StudentId == request.StudentId && p.FeeStructureId == request.FeeStructureId)
            .SumAsync(p => p.AmountPaid) + request.AmountPaid;

        var status = totalPaid >= feeStructure.Amount ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

        var payment = new FeePayment
        {
            StudentId = request.StudentId, FeeStructureId = request.FeeStructureId,
            AmountPaid = request.AmountPaid, PaymentMethod = request.PaymentMethod,
            ReceiptNumber = request.ReceiptNumber, Status = status
        };
        _db.FeePayments.Add(payment);
        await _db.SaveChangesAsync();
        return Ok(new { payment.Id, Status = status.ToString(), message = "Payment recorded successfully" });
    }

    [HttpGet("student/{studentId}")]
    public async Task<IActionResult> GetStudentFees(int studentId)
    {
        var student = await _db.Students.Include(s => s.User).Include(s => s.Class).FirstOrDefaultAsync(s => s.Id == studentId);
        if (student == null) return NotFound();

        var feeStructures = student.ClassId.HasValue
            ? await _db.FeeStructures.Where(f => f.ClassId == student.ClassId).ToListAsync()
            : new List<FeeStructure>();

        var feeDetails = new List<object>();
        double totalFee = 0, totalPaid = 0;

        foreach (var fs in feeStructures)
        {
            var payments = await _db.FeePayments.Where(p => p.StudentId == studentId && p.FeeStructureId == fs.Id).ToListAsync();
            var paid = payments.Sum(p => p.AmountPaid);
            totalFee += fs.Amount;
            totalPaid += paid;
            feeDetails.Add(new { fs.Name, fs.Amount, Paid = paid, Balance = fs.Amount - paid, Status = paid >= fs.Amount ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID" });
        }

        return Ok(new { StudentId = studentId, TotalFee = totalFee, TotalPaid = totalPaid, Balance = totalFee - totalPaid, Fees = feeDetails });
    }

    [HttpGet("report")]
    [Authorize(Roles = "ADMIN,ACCOUNTANT")]
    public async Task<IActionResult> GetReport()
    {
        var structures = await _db.FeeStructures.Include(f => f.Class).ThenInclude(c => c.Students).ToListAsync();
        var report = new List<object>();

        foreach (var fs in structures)
        {
            var payments = await _db.FeePayments.Where(p => p.FeeStructureId == fs.Id).ToListAsync();
            report.Add(new
            {
                fs.Name, fs.Amount, Class = fs.Class.Name, fs.Term, fs.AcademicYear,
                TotalCollected = payments.Sum(p => p.AmountPaid),
                PaymentCount = payments.Count
            });
        }

        return Ok(new
        {
            TotalExpected = structures.Sum(s => s.Amount * (s.Class?.Students?.Count ?? 0)),
            TotalCollected = await _db.FeePayments.SumAsync(p => p.AmountPaid),
            Structures = report
        });
    }
}
