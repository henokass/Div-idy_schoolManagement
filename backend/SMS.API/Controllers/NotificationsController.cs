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
public class NotificationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public NotificationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<NotificationResponseDto>>> GetAll([FromQuery] string? targetRole)
    {
        var query = _context.Notifications.AsQueryable();

        if (!string.IsNullOrEmpty(targetRole))
            query = query.Where(n => n.TargetRole == targetRole || n.TargetRole == "All");

        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationResponseDto(
                n.Id, n.Title, n.Message, n.SentBy,
                n.TargetRole, n.CreatedAt, n.IsRead
            )).ToListAsync();

        return Ok(notifications);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<NotificationResponseDto>> Create(NotificationCreateDto dto)
    {
        var username = User.Identity?.Name ?? "System";

        var notification = new Notification
        {
            Title = dto.Title,
            Message = dto.Message,
            SentBy = username,
            TargetRole = dto.TargetRole,
            TargetUserId = dto.TargetUserId
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        return Ok(new NotificationResponseDto(
            notification.Id, notification.Title, notification.Message,
            notification.SentBy, notification.TargetRole,
            notification.CreatedAt, notification.IsRead));
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null) return NotFound();

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null) return NotFound();

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
