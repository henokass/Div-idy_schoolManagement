using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS.API.Models;

public class BookIssue
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int BookId { get; set; }
    [ForeignKey("BookId")]
    public LibraryBook Book { get; set; } = null!;

    [Required]
    public int StudentId { get; set; }
    [ForeignKey("StudentId")]
    public Student Student { get; set; } = null!;

    public DateTime IssueDate { get; set; } = DateTime.UtcNow;

    public DateTime DueDate { get; set; }

    public DateTime? ReturnDate { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Fine { get; set; }
}
