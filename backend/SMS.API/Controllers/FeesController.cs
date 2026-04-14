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
public class FeesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public FeesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Fee Structure endpoints
    [HttpGet("structures")]
    public async Task<ActionResult<List<FeeStructureResponseDto>>> GetStructures([FromQuery] string? academicYear)
    {
        var query = _context.FeeStructures.AsQueryable();

        if (!string.IsNullOrEmpty(academicYear))
            query = query.Where(f => f.AcademicYear == academicYear);

        var structures = await query.Select(f => new FeeStructureResponseDto(
            f.Id, f.ClassName, f.FeeType, f.Amount, f.AcademicYear, f.Description
        )).ToListAsync();

        return Ok(structures);
    }

    [HttpPost("structures")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<ActionResult<FeeStructureResponseDto>> CreateStructure(FeeStructureCreateDto dto)
    {
        var structure = new FeeStructure
        {
            ClassName = dto.ClassName,
            FeeType = dto.FeeType,
            Amount = dto.Amount,
            AcademicYear = dto.AcademicYear,
            Description = dto.Description
        };

        _context.FeeStructures.Add(structure);
        await _context.SaveChangesAsync();

        return Ok(new FeeStructureResponseDto(
            structure.Id, structure.ClassName, structure.FeeType,
            structure.Amount, structure.AcademicYear, structure.Description));
    }

    [HttpPut("structures/{id}")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> UpdateStructure(int id, FeeStructureCreateDto dto)
    {
        var structure = await _context.FeeStructures.FindAsync(id);
        if (structure == null) return NotFound();

        structure.ClassName = dto.ClassName;
        structure.FeeType = dto.FeeType;
        structure.Amount = dto.Amount;
        structure.AcademicYear = dto.AcademicYear;
        structure.Description = dto.Description;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("structures/{id}")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> DeleteStructure(int id)
    {
        var structure = await _context.FeeStructures.FindAsync(id);
        if (structure == null) return NotFound();

        _context.FeeStructures.Remove(structure);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Fee Payment endpoints
    [HttpGet("payments")]
    public async Task<ActionResult<List<FeePaymentResponseDto>>> GetPayments(
        [FromQuery] int? studentId, [FromQuery] PaymentStatus? status)
    {
        var query = _context.FeePayments
            .Include(f => f.Student)
            .Include(f => f.FeeStructure)
            .AsQueryable();

        if (studentId.HasValue)
            query = query.Where(f => f.StudentId == studentId);
        if (status.HasValue)
            query = query.Where(f => f.Status == status);

        var payments = await query.Select(f => new FeePaymentResponseDto(
            f.Id,
            f.Student.FirstName + " " + f.Student.LastName,
            f.FeeStructure.FeeType,
            f.AmountPaid, f.PaymentDate, f.PaymentMethod,
            f.TransactionId, f.Status
        )).OrderByDescending(f => f.PaymentDate).ToListAsync();

        return Ok(payments);
    }

    [HttpPost("payments")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<ActionResult<FeePaymentResponseDto>> CreatePayment(FeePaymentCreateDto dto)
    {
        var student = await _context.Students.FindAsync(dto.StudentId);
        if (student == null) return BadRequest(new { message = "Student not found" });

        var feeStructure = await _context.FeeStructures.FindAsync(dto.FeeStructureId);
        if (feeStructure == null) return BadRequest(new { message = "Fee structure not found" });

        var payment = new FeePayment
        {
            StudentId = dto.StudentId,
            FeeStructureId = dto.FeeStructureId,
            AmountPaid = dto.AmountPaid,
            PaymentMethod = dto.PaymentMethod,
            TransactionId = dto.TransactionId,
            Status = PaymentStatus.Completed
        };

        _context.FeePayments.Add(payment);
        await _context.SaveChangesAsync();

        return Ok(new FeePaymentResponseDto(
            payment.Id,
            student.FirstName + " " + student.LastName,
            feeStructure.FeeType,
            payment.AmountPaid, payment.PaymentDate, payment.PaymentMethod,
            payment.TransactionId, payment.Status));
    }

    [HttpGet("summary")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> GetFinancialSummary([FromQuery] string? academicYear)
    {
        var totalCollected = await _context.FeePayments
            .Where(f => f.Status == PaymentStatus.Completed)
            .SumAsync(f => f.AmountPaid);

        var totalPending = await _context.FeePayments
            .Where(f => f.Status == PaymentStatus.Pending)
            .SumAsync(f => f.AmountPaid);

        var recentPayments = await _context.FeePayments
            .Include(f => f.Student)
            .Include(f => f.FeeStructure)
            .OrderByDescending(f => f.PaymentDate)
            .Take(10)
            .Select(f => new FeePaymentResponseDto(
                f.Id,
                f.Student.FirstName + " " + f.Student.LastName,
                f.FeeStructure.FeeType,
                f.AmountPaid, f.PaymentDate, f.PaymentMethod,
                f.TransactionId, f.Status
            )).ToListAsync();

        return Ok(new
        {
            TotalCollected = totalCollected,
            TotalPending = totalPending,
            RecentPayments = recentPayments
        });
    }
}
