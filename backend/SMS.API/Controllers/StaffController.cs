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
public class StaffController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public StaffController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<StaffResponseDto>>> GetAll([FromQuery] string? search, [FromQuery] string? department)
    {
        var query = _context.Staff.AsQueryable();

        if (!string.IsNullOrEmpty(search))
            query = query.Where(s => s.FirstName.Contains(search) || s.LastName.Contains(search) || s.StaffIdNumber.Contains(search));

        if (!string.IsNullOrEmpty(department))
            query = query.Where(s => s.Department == department);

        var staff = await query.Select(s => new StaffResponseDto(
            s.Id, s.StaffIdNumber, s.FirstName, s.LastName,
            s.DateOfBirth, s.Gender, s.Address, s.PhoneNumber,
            s.Email, s.Department, s.Position, s.HireDate,
            s.Salary, s.IsActive
        )).ToListAsync();

        return Ok(staff);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StaffResponseDto>> GetById(int id)
    {
        var s = await _context.Staff.FindAsync(id);
        if (s == null) return NotFound();

        return Ok(new StaffResponseDto(
            s.Id, s.StaffIdNumber, s.FirstName, s.LastName,
            s.DateOfBirth, s.Gender, s.Address, s.PhoneNumber,
            s.Email, s.Department, s.Position, s.HireDate,
            s.Salary, s.IsActive));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<StaffResponseDto>> Create(StaffCreateDto dto)
    {
        if (await _context.Staff.AnyAsync(s => s.StaffIdNumber == dto.StaffIdNumber))
            return BadRequest(new { message = "Staff ID already exists" });

        var staff = new Staff
        {
            StaffIdNumber = dto.StaffIdNumber,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            Address = dto.Address,
            PhoneNumber = dto.PhoneNumber,
            Email = dto.Email,
            Department = dto.Department,
            Position = dto.Position,
            HireDate = dto.HireDate,
            Salary = dto.Salary
        };

        _context.Staff.Add(staff);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = staff.Id },
            new StaffResponseDto(staff.Id, staff.StaffIdNumber, staff.FirstName, staff.LastName,
                staff.DateOfBirth, staff.Gender, staff.Address, staff.PhoneNumber,
                staff.Email, staff.Department, staff.Position, staff.HireDate,
                staff.Salary, staff.IsActive));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, StaffUpdateDto dto)
    {
        var staff = await _context.Staff.FindAsync(id);
        if (staff == null) return NotFound();

        staff.FirstName = dto.FirstName;
        staff.LastName = dto.LastName;
        staff.DateOfBirth = dto.DateOfBirth;
        staff.Gender = dto.Gender;
        staff.Address = dto.Address;
        staff.PhoneNumber = dto.PhoneNumber;
        staff.Email = dto.Email;
        staff.Department = dto.Department;
        staff.Position = dto.Position;
        staff.Salary = dto.Salary;
        staff.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var staff = await _context.Staff.FindAsync(id);
        if (staff == null) return NotFound();

        _context.Staff.Remove(staff);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
