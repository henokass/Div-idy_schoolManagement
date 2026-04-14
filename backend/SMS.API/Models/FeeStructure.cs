using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS.API.Models;

public class FeeStructure
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string ClassName { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string FeeType { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required, MaxLength(20)]
    public string AcademicYear { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Description { get; set; } = string.Empty;

    public ICollection<FeePayment> FeePayments { get; set; } = new List<FeePayment>();
}
