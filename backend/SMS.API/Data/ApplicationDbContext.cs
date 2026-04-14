using Microsoft.EntityFrameworkCore;
using SMS.API.Models;

namespace SMS.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Parent> Parents => Set<Parent>();
    public DbSet<Staff> Staff => Set<Staff>();
    public DbSet<SchoolClass> Classes => Set<SchoolClass>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<Grade> Grades => Set<Grade>();
    public DbSet<FeeStructure> FeeStructures => Set<FeeStructure>();
    public DbSet<FeePayment> FeePayments => Set<FeePayment>();
    public DbSet<Timetable> Timetables => Set<Timetable>();
    public DbSet<LibraryBook> LibraryBooks => Set<LibraryBook>();
    public DbSet<BookIssue> BookIssues => Set<BookIssue>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Student>()
            .HasIndex(s => s.StudentIdNumber)
            .IsUnique();

        modelBuilder.Entity<Staff>()
            .HasIndex(s => s.StaffIdNumber)
            .IsUnique();

        modelBuilder.Entity<Subject>()
            .HasIndex(s => s.Code)
            .IsUnique();

        // Prevent cascade delete cycles
        modelBuilder.Entity<Student>()
            .HasOne(s => s.Class)
            .WithMany(c => c.Students)
            .HasForeignKey(s => s.ClassId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Student>()
            .HasOne(s => s.Parent)
            .WithMany(p => p.Students)
            .HasForeignKey(s => s.ParentId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<SchoolClass>()
            .HasOne(c => c.ClassTeacher)
            .WithMany(s => s.Classes)
            .HasForeignKey(c => c.TeacherId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Subject>()
            .HasOne(s => s.Teacher)
            .WithMany(t => t.Subjects)
            .HasForeignKey(s => s.TeacherId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Subject>()
            .HasOne(s => s.Class)
            .WithMany(c => c.Subjects)
            .HasForeignKey(s => s.ClassId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Grade>()
            .HasOne(g => g.Student)
            .WithMany(s => s.Grades)
            .HasForeignKey(g => g.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Grade>()
            .HasOne(g => g.Subject)
            .WithMany(s => s.Grades)
            .HasForeignKey(g => g.SubjectId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Grade>()
            .HasOne(g => g.Exam)
            .WithMany(e => e.Grades)
            .HasForeignKey(g => g.ExamId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Timetable>()
            .HasOne(t => t.Subject)
            .WithMany(s => s.Timetables)
            .HasForeignKey(t => t.SubjectId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<FeePayment>()
            .HasOne(f => f.Student)
            .WithMany(s => s.FeePayments)
            .HasForeignKey(f => f.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FeePayment>()
            .HasOne(f => f.FeeStructure)
            .WithMany(fs => fs.FeePayments)
            .HasForeignKey(f => f.FeeStructureId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<BookIssue>()
            .HasOne(bi => bi.Student)
            .WithMany(s => s.BookIssues)
            .HasForeignKey(bi => bi.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BookIssue>()
            .HasOne(bi => bi.Book)
            .WithMany(b => b.BookIssues)
            .HasForeignKey(bi => bi.BookId)
            .OnDelete(DeleteBehavior.NoAction);

        // Seed default admin user (password: Admin@123)
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 1,
            Username = "admin",
            Email = "admin@goldenacademy.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}
