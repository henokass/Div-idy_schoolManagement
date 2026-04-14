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
public class AnnouncementsController : ControllerBase
{
    private readonly SchoolDbContext _db;
    public AnnouncementsController(SchoolDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? audience)
    {
        var query = _db.Announcements.Where(a => a.IsActive).AsQueryable();
        if (!string.IsNullOrEmpty(audience)) query = query.Where(a => a.Audience == audience || a.Audience == "ALL");
        var announcements = await query.OrderByDescending(a => a.CreatedAt).ToListAsync();
        return Ok(announcements);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Create([FromBody] CreateAnnouncementRequest request)
    {
        var announcement = new Announcement { Title = request.Title, Content = request.Content, Audience = request.Audience ?? "ALL", ExpiresAt = request.ExpiresAt };
        _db.Announcements.Add(announcement);
        await _db.SaveChangesAsync();
        return Ok(new { announcement.Id, message = "Announcement created successfully" });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAnnouncementRequest request)
    {
        var announcement = await _db.Announcements.FindAsync(id);
        if (announcement == null) return NotFound();
        if (request.Title != null) announcement.Title = request.Title;
        if (request.Content != null) announcement.Content = request.Content;
        if (request.Audience != null) announcement.Audience = request.Audience;
        if (request.IsActive.HasValue) announcement.IsActive = request.IsActive.Value;
        if (request.ExpiresAt.HasValue) announcement.ExpiresAt = request.ExpiresAt;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Announcement updated successfully" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Delete(int id)
    {
        var announcement = await _db.Announcements.FindAsync(id);
        if (announcement == null) return NotFound();
        _db.Announcements.Remove(announcement);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Announcement deleted successfully" });
    }
}
