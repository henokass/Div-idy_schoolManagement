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
public class ParentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ParentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<ParentResponseDto>>> GetAll([FromQuery] string? search)
    {
        var query = _context.Parents.Include(p => p.Students).AsQueryable();

        if (!string.IsNullOrEmpty(search))
            query = query.Where(p => p.FirstName.Contains(search) || p.LastName.Contains(search));

        var parents = await query.Select(p => new ParentResponseDto(
            p.Id, p.FirstName, p.LastName, p.PhoneNumber,
            p.Email, p.Address, p.Occupation,
            p.Students.Select(s => s.FirstName + " " + s.LastName).ToList()
        )).ToListAsync();

        return Ok(parents);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ParentResponseDto>> GetById(int id)
    {
        var p = await _context.Parents.Include(p => p.Students).FirstOrDefaultAsync(p => p.Id == id);
        if (p == null) return NotFound();

        return Ok(new ParentResponseDto(
            p.Id, p.FirstName, p.LastName, p.PhoneNumber,
            p.Email, p.Address, p.Occupation,
            p.Students.Select(s => s.FirstName + " " + s.LastName).ToList()));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ParentResponseDto>> Create(ParentCreateDto dto)
    {
        var parent = new Parent
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhoneNumber = dto.PhoneNumber,
            Email = dto.Email,
            Address = dto.Address,
            Occupation = dto.Occupation
        };

        _context.Parents.Add(parent);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = parent.Id },
            new ParentResponseDto(parent.Id, parent.FirstName, parent.LastName,
                parent.PhoneNumber, parent.Email, parent.Address, parent.Occupation, new List<string>()));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, ParentCreateDto dto)
    {
        var parent = await _context.Parents.FindAsync(id);
        if (parent == null) return NotFound();

        parent.FirstName = dto.FirstName;
        parent.LastName = dto.LastName;
        parent.PhoneNumber = dto.PhoneNumber;
        parent.Email = dto.Email;
        parent.Address = dto.Address;
        parent.Occupation = dto.Occupation;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var parent = await _context.Parents.FindAsync(id);
        if (parent == null) return NotFound();

        _context.Parents.Remove(parent);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
