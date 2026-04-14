using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Data;

public class SchoolDbContext : DbContext
{
    public SchoolDbContext(DbContextOptions<SchoolDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Student> Students { get; set; }
    public DbSet<Teacher> Teachers { get; set; }
    public DbSet<Parent> Parents { get; set; }
    public DbSet<Class> Classes { get; set; }
    public DbSet<Subject> Subjects { get; set; }
    public DbSet<SubjectTeacher> SubjectTeachers { get; set; }
    public DbSet<ClassSubject> ClassSubjects { get; set; }
    public DbSet<Attendance> Attendances { get; set; }
    public DbSet<Grade> Grades { get; set; }
    public DbSet<TimetableSlot> TimetableSlots { get; set; }
    public DbSet<FeeStructure> FeeStructures { get; set; }
    public DbSet<FeePayment> FeePayments { get; set; }
    public DbSet<Book> Books { get; set; }
    public DbSet<BookIssue> BookIssues { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Announcement> Announcements { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Username).IsUnique();
            e.Property(u => u.Role).HasConversion<string>();
        });

        modelBuilder.Entity<Student>(e =>
        {
            e.HasIndex(s => s.AdmissionNumber).IsUnique();
            e.HasOne(s => s.User).WithOne(u => u.Student).HasForeignKey<Student>(s => s.UserId);
            e.HasOne(s => s.Class).WithMany(c => c.Students).HasForeignKey(s => s.ClassId);
            e.HasOne(s => s.Parent).WithMany(p => p.Students).HasForeignKey(s => s.ParentId);
            e.Property(s => s.Gender).HasConversion<string>();
        });

        modelBuilder.Entity<Teacher>(e =>
        {
            e.HasIndex(t => t.EmployeeId).IsUnique();
            e.HasOne(t => t.User).WithOne(u => u.Teacher).HasForeignKey<Teacher>(t => t.UserId);
        });

        modelBuilder.Entity<Parent>(e =>
        {
            e.HasOne(p => p.User).WithOne(u => u.Parent).HasForeignKey<Parent>(p => p.UserId);
        });

        modelBuilder.Entity<Class>(e =>
        {
            e.HasOne(c => c.Teacher).WithMany(t => t.Classes).HasForeignKey(c => c.TeacherId);
        });

        modelBuilder.Entity<SubjectTeacher>(e =>
        {
            e.HasOne(st => st.Subject).WithMany(s => s.SubjectTeachers).HasForeignKey(st => st.SubjectId);
            e.HasOne(st => st.Teacher).WithMany(t => t.SubjectTeachers).HasForeignKey(st => st.TeacherId);
        });

        modelBuilder.Entity<ClassSubject>(e =>
        {
            e.HasOne(cs => cs.Class).WithMany(c => c.ClassSubjects).HasForeignKey(cs => cs.ClassId);
            e.HasOne(cs => cs.Subject).WithMany(s => s.ClassSubjects).HasForeignKey(cs => cs.SubjectId);
        });

        modelBuilder.Entity<Attendance>(e =>
        {
            e.HasOne(a => a.Student).WithMany(s => s.Attendances).HasForeignKey(a => a.StudentId);
        });

        modelBuilder.Entity<Grade>(e =>
        {
            e.HasOne(g => g.Student).WithMany(s => s.Grades).HasForeignKey(g => g.StudentId);
            e.HasOne(g => g.Subject).WithMany(s => s.Grades).HasForeignKey(g => g.SubjectId);
        });

        modelBuilder.Entity<TimetableSlot>(e =>
        {
            e.HasOne(t => t.Class).WithMany(c => c.TimetableSlots).HasForeignKey(t => t.ClassId);
            e.HasOne(t => t.Subject).WithMany(s => s.TimetableSlots).HasForeignKey(t => t.SubjectId);
            e.HasOne(t => t.Teacher).WithMany(t => t.TimetableSlots).HasForeignKey(t => t.TeacherId);
        });

        modelBuilder.Entity<FeeStructure>(e =>
        {
            e.HasOne(f => f.Class).WithMany(c => c.FeeStructures).HasForeignKey(f => f.ClassId);
        });

        modelBuilder.Entity<FeePayment>(e =>
        {
            e.HasOne(fp => fp.Student).WithMany(s => s.FeePayments).HasForeignKey(fp => fp.StudentId);
            e.HasOne(fp => fp.FeeStructure).WithMany(f => f.Payments).HasForeignKey(fp => fp.FeeStructureId);
            e.Property(fp => fp.Status).HasConversion<string>();
        });

        modelBuilder.Entity<Book>(e =>
        {
            e.Property(b => b.Status).HasConversion<string>();
        });

        modelBuilder.Entity<BookIssue>(e =>
        {
            e.HasOne(bi => bi.Book).WithMany(b => b.BookIssues).HasForeignKey(bi => bi.BookId);
            e.HasOne(bi => bi.Student).WithMany(s => s.BookIssues).HasForeignKey(bi => bi.StudentId);
        });

        modelBuilder.Entity<Notification>(e =>
        {
            e.HasOne(n => n.Recipient).WithMany(u => u.ReceivedNotifications).HasForeignKey(n => n.RecipientId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(n => n.Sender).WithMany(u => u.SentNotifications).HasForeignKey(n => n.SenderId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Attendance>(e =>
        {
            e.Property(a => a.Status).HasConversion<string>();
        });
    }
}
