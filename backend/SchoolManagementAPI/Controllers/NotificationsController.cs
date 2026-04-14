using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;
using System.Security.Claims;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly SchoolDbContext _db;
    public NotificationsController(SchoolDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var notifications = await _db.Notifications
            .Include(n => n.Sender)
            .Where(n => n.RecipientId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new
            {
                n.Id, n.Title, n.Message, n.IsRead, n.CreatedAt,
                Sender = n.Sender == null ? null : new { n.Sender.FirstName, n.Sender.LastName }
            })
            .ToListAsync();
        return Ok(notifications);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var count = await _db.Notifications.CountAsync(n => n.RecipientId == userId && !n.IsRead);
        return Ok(new { count });
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN,TEACHER")]
    public async Task<IActionResult> Send([FromBody] SendNotificationRequest request)
    {
        var senderId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var notification = new Notification { Title = request.Title, Message = request.Message, RecipientId = request.RecipientId, SenderId = senderId };
        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();
        return Ok(new { notification.Id, message = "Notification sent successfully" });
    }

    [HttpPost("bulk")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> BulkSend([FromBody] BulkNotificationRequest request)
    {
        var senderId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var notifications = request.RecipientIds.Select(rid => new Notification { Title = request.Title, Message = request.Message, RecipientId = rid, SenderId = senderId });
        _db.Notifications.AddRange(notifications);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Notifications sent successfully", count = request.RecipientIds.Count });
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var notification = await _db.Notifications.FindAsync(id);
        if (notification == null) return NotFound();
        notification.IsRead = true;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Marked as read" });
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var notifications = await _db.Notifications.Where(n => n.RecipientId == userId && !n.IsRead).ToListAsync();
        notifications.ForEach(n => n.IsRead = true);
        await _db.SaveChangesAsync();
        return Ok(new { message = "All notifications marked as read" });
    }
}
