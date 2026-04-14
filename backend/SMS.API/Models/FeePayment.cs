using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS.API.Models;

public enum PaymentStatus
{
    Pending,
    Completed,
    Failed,
    Refunded
}

public class FeePayment
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }
    [ForeignKey("StudentId")]
    public Student Student { get; set; } = null!;

    [Required]
    public int FeeStructureId { get; set; }
    [ForeignKey("FeeStructureId")]
    public FeeStructure FeeStructure { get; set; } = null!;

    [Column(TypeName = "decimal(18,2)")]
    public decimal AmountPaid { get; set; }

    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

    [MaxLength(50)]
    public string PaymentMethod { get; set; } = string.Empty;

    [MaxLength(100)]
    public string TransactionId { get; set; } = string.Empty;

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
}
