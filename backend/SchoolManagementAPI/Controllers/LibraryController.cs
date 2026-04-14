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
public class LibraryController : ControllerBase
{
    private readonly SchoolDbContext _db;
    public LibraryController(SchoolDbContext db) => _db = db;

    [HttpGet("books")]
    public async Task<IActionResult> GetBooks([FromQuery] string? search, [FromQuery] string? category)
    {
        var query = _db.Books.AsQueryable();
        if (!string.IsNullOrEmpty(search)) query = query.Where(b => b.Title.Contains(search) || b.Author.Contains(search));
        if (!string.IsNullOrEmpty(category)) query = query.Where(b => b.Category == category);
        return Ok(await query.ToListAsync());
    }

    [HttpPost("books")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> CreateBook([FromBody] CreateBookRequest request)
    {
        var book = new Book { Title = request.Title, Author = request.Author, ISBN = request.ISBN, Category = request.Category, Quantity = request.Quantity, Available = request.Quantity };
        _db.Books.Add(book);
        await _db.SaveChangesAsync();
        return Ok(new { book.Id, message = "Book added successfully" });
    }

    [HttpPut("books/{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> UpdateBook(int id, [FromBody] UpdateBookRequest request)
    {
        var book = await _db.Books.FindAsync(id);
        if (book == null) return NotFound();
        if (request.Title != null) book.Title = request.Title;
        if (request.Author != null) book.Author = request.Author;
        if (request.ISBN != null) book.ISBN = request.ISBN;
        if (request.Category != null) book.Category = request.Category;
        if (request.Quantity.HasValue) book.Quantity = request.Quantity.Value;
        if (request.Available.HasValue) book.Available = request.Available.Value;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Book updated successfully" });
    }

    [HttpDelete("books/{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var book = await _db.Books.FindAsync(id);
        if (book == null) return NotFound();
        _db.Books.Remove(book);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Book deleted successfully" });
    }

    [HttpPost("issue")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> IssueBook([FromBody] IssueBookRequest request)
    {
        var book = await _db.Books.FindAsync(request.BookId);
        if (book == null) return NotFound(new { error = "Book not found" });
        if (book.Available <= 0) return BadRequest(new { error = "Book not available" });

        book.Available--;
        var issue = new BookIssue { BookId = request.BookId, StudentId = request.StudentId, DueDate = request.DueDate };
        _db.BookIssues.Add(issue);
        await _db.SaveChangesAsync();
        return Ok(new { issue.Id, message = "Book issued successfully" });
    }

    [HttpPut("return/{issueId}")]
    public async Task<IActionResult> ReturnBook(int issueId)
    {
        var issue = await _db.BookIssues.Include(i => i.Book).FirstOrDefaultAsync(i => i.Id == issueId);
        if (issue == null) return NotFound();
        if (issue.ReturnDate.HasValue) return BadRequest(new { error = "Book already returned" });

        issue.ReturnDate = DateTime.UtcNow;
        issue.Book.Available++;

        // Calculate fine: 5 birr per day late
        if (issue.ReturnDate > issue.DueDate)
        {
            var daysLate = (issue.ReturnDate.Value - issue.DueDate).Days;
            issue.Fine = daysLate * 5;
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Book returned successfully", Fine = issue.Fine });
    }

    [HttpGet("issues")]
    public async Task<IActionResult> GetIssues([FromQuery] int? studentId)
    {
        var query = _db.BookIssues.Include(i => i.Book).Include(i => i.Student).ThenInclude(s => s.User).AsQueryable();
        if (studentId.HasValue) query = query.Where(i => i.StudentId == studentId.Value);

        var issues = await query.Select(i => new
        {
            i.Id, i.IssueDate, i.DueDate, i.ReturnDate, i.Fine,
            Book = new { i.Book.Id, i.Book.Title, i.Book.Author },
            Student = new { i.Student.Id, User = new { i.Student.User.FirstName, i.Student.User.LastName } }
        }).ToListAsync();
        return Ok(issues);
    }
}
