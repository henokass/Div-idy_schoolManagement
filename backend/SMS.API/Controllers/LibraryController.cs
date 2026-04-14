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
public class LibraryController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LibraryController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Book endpoints
    [HttpGet("books")]
    public async Task<ActionResult<List<LibraryBookResponseDto>>> GetBooks([FromQuery] string? search, [FromQuery] string? category)
    {
        var query = _context.LibraryBooks.AsQueryable();

        if (!string.IsNullOrEmpty(search))
            query = query.Where(b => b.Title.Contains(search) || b.Author.Contains(search) || b.ISBN.Contains(search));
        if (!string.IsNullOrEmpty(category))
            query = query.Where(b => b.Category == category);

        var books = await query.Select(b => new LibraryBookResponseDto(
            b.Id, b.Title, b.Author, b.ISBN, b.Category, b.TotalCopies, b.AvailableCopies
        )).ToListAsync();

        return Ok(books);
    }

    [HttpGet("books/{id}")]
    public async Task<ActionResult<LibraryBookResponseDto>> GetBookById(int id)
    {
        var b = await _context.LibraryBooks.FindAsync(id);
        if (b == null) return NotFound();

        return Ok(new LibraryBookResponseDto(b.Id, b.Title, b.Author, b.ISBN, b.Category, b.TotalCopies, b.AvailableCopies));
    }

    [HttpPost("books")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<LibraryBookResponseDto>> CreateBook(LibraryBookCreateDto dto)
    {
        var book = new LibraryBook
        {
            Title = dto.Title,
            Author = dto.Author,
            ISBN = dto.ISBN,
            Category = dto.Category,
            TotalCopies = dto.TotalCopies,
            AvailableCopies = dto.TotalCopies
        };

        _context.LibraryBooks.Add(book);
        await _context.SaveChangesAsync();

        return Ok(new LibraryBookResponseDto(book.Id, book.Title, book.Author, book.ISBN, book.Category, book.TotalCopies, book.AvailableCopies));
    }

    [HttpPut("books/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateBook(int id, LibraryBookCreateDto dto)
    {
        var book = await _context.LibraryBooks.FindAsync(id);
        if (book == null) return NotFound();

        var diff = dto.TotalCopies - book.TotalCopies;
        book.Title = dto.Title;
        book.Author = dto.Author;
        book.ISBN = dto.ISBN;
        book.Category = dto.Category;
        book.TotalCopies = dto.TotalCopies;
        book.AvailableCopies = Math.Max(0, book.AvailableCopies + diff);

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("books/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var book = await _context.LibraryBooks.FindAsync(id);
        if (book == null) return NotFound();

        _context.LibraryBooks.Remove(book);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Book Issue endpoints
    [HttpGet("issues")]
    public async Task<ActionResult<List<BookIssueResponseDto>>> GetIssues([FromQuery] int? studentId, [FromQuery] bool? overdue)
    {
        var query = _context.BookIssues
            .Include(bi => bi.Book)
            .Include(bi => bi.Student)
            .AsQueryable();

        if (studentId.HasValue)
            query = query.Where(bi => bi.StudentId == studentId);
        if (overdue == true)
            query = query.Where(bi => bi.ReturnDate == null && bi.DueDate < DateTime.UtcNow);

        var issues = await query.Select(bi => new BookIssueResponseDto(
            bi.Id, bi.Book.Title,
            bi.Student.FirstName + " " + bi.Student.LastName,
            bi.IssueDate, bi.DueDate, bi.ReturnDate, bi.Fine
        )).OrderByDescending(bi => bi.IssueDate).ToListAsync();

        return Ok(issues);
    }

    [HttpPost("issues")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<BookIssueResponseDto>> IssueBook(BookIssueCreateDto dto)
    {
        var book = await _context.LibraryBooks.FindAsync(dto.BookId);
        if (book == null) return BadRequest(new { message = "Book not found" });
        if (book.AvailableCopies <= 0) return BadRequest(new { message = "No copies available" });

        var student = await _context.Students.FindAsync(dto.StudentId);
        if (student == null) return BadRequest(new { message = "Student not found" });

        var issue = new BookIssue
        {
            BookId = dto.BookId,
            StudentId = dto.StudentId,
            DueDate = dto.DueDate
        };

        book.AvailableCopies--;
        _context.BookIssues.Add(issue);
        await _context.SaveChangesAsync();

        return Ok(new BookIssueResponseDto(
            issue.Id, book.Title,
            student.FirstName + " " + student.LastName,
            issue.IssueDate, issue.DueDate, issue.ReturnDate, issue.Fine));
    }

    [HttpPut("issues/{id}/return")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ReturnBook(int id)
    {
        var issue = await _context.BookIssues.Include(bi => bi.Book).FirstOrDefaultAsync(bi => bi.Id == id);
        if (issue == null) return NotFound();
        if (issue.ReturnDate != null) return BadRequest(new { message = "Book already returned" });

        issue.ReturnDate = DateTime.UtcNow;
        issue.Book.AvailableCopies++;

        // Calculate fine: $1 per day overdue
        if (issue.ReturnDate > issue.DueDate)
        {
            var daysOverdue = (issue.ReturnDate.Value - issue.DueDate).Days;
            issue.Fine = daysOverdue * 1.0m;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Book returned successfully", Fine = issue.Fine });
    }
}
