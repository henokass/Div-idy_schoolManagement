using System.ComponentModel.DataAnnotations;

namespace SMS.API.Models;

public class LibraryBook
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Author { get; set; } = string.Empty;

    [MaxLength(20)]
    public string ISBN { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;

    public int TotalCopies { get; set; }

    public int AvailableCopies { get; set; }

    public ICollection<BookIssue> BookIssues { get; set; } = new List<BookIssue>();
}
