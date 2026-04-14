using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;
using BCrypt.Net;

namespace SchoolManagementAPI.Services;

public static class DbSeeder
{
    public static async Task SeedAsync(SchoolDbContext db)
    {
        if (db.Users.Any()) return;

        // Create users
        var admin = new User { Username = "admin", PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), FirstName = "Admin", LastName = "User", Email = "admin@goldenacademy.edu", Role = Role.ADMIN };
        var teacher1User = new User { Username = "teacher1", PasswordHash = BCrypt.Net.BCrypt.HashPassword("teacher123"), FirstName = "Abebe", LastName = "Kebede", Email = "abebe@goldenacademy.edu", Role = Role.TEACHER };
        var teacher2User = new User { Username = "teacher2", PasswordHash = BCrypt.Net.BCrypt.HashPassword("teacher123"), FirstName = "Sara", LastName = "Tadesse", Email = "sara@goldenacademy.edu", Role = Role.TEACHER };
        var parent1User = new User { Username = "parent1", PasswordHash = BCrypt.Net.BCrypt.HashPassword("parent123"), FirstName = "Dawit", LastName = "Haile", Email = "dawit@email.com", Role = Role.PARENT };
        var accountantUser = new User { Username = "accountant1", PasswordHash = BCrypt.Net.BCrypt.HashPassword("accountant123"), FirstName = "Meron", LastName = "Alemu", Email = "meron@goldenacademy.edu", Role = Role.ACCOUNTANT };

        var studentUsers = new List<User>();
        for (int i = 1; i <= 5; i++)
        {
            studentUsers.Add(new User { Username = $"student{i}", PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"), FirstName = $"Student{i}", LastName = $"Last{i}", Email = $"student{i}@goldenacademy.edu", Role = Role.STUDENT });
        }

        db.Users.AddRange(admin, teacher1User, teacher2User, parent1User, accountantUser);
        db.Users.AddRange(studentUsers);
        await db.SaveChangesAsync();

        // Create teachers
        var teacher1 = new Teacher { UserId = teacher1User.Id, EmployeeId = "EMP001", Qualification = "M.Sc. Mathematics" };
        var teacher2 = new Teacher { UserId = teacher2User.Id, EmployeeId = "EMP002", Qualification = "B.Ed. English" };
        db.Teachers.AddRange(teacher1, teacher2);
        await db.SaveChangesAsync();

        // Create parent
        var parent1 = new Parent { UserId = parent1User.Id, Occupation = "Engineer", Address = "Addis Ababa, Ethiopia" };
        db.Parents.Add(parent1);
        await db.SaveChangesAsync();

        // Create classes
        var class1 = new Class { Name = "Grade 1", Section = "A", Capacity = 40, TeacherId = teacher1.Id };
        var class2 = new Class { Name = "Grade 2", Section = "A", Capacity = 40, TeacherId = teacher2.Id };
        db.Classes.AddRange(class1, class2);
        await db.SaveChangesAsync();

        // Create students
        var students = new List<Student>();
        for (int i = 0; i < 5; i++)
        {
            students.Add(new Student
            {
                UserId = studentUsers[i].Id,
                AdmissionNumber = $"ADM{2024001 + i}",
                DateOfBirth = new DateTime(2015, 1 + i, 15),
                Gender = i % 2 == 0 ? Gender.MALE : Gender.FEMALE,
                Address = "Addis Ababa, Ethiopia",
                ClassId = i < 3 ? class1.Id : class2.Id,
                ParentId = i == 0 ? parent1.Id : null
            });
        }
        db.Students.AddRange(students);
        await db.SaveChangesAsync();

        // Create subjects
        var math = new Subject { Name = "Mathematics", Code = "MATH101", Description = "Basic Mathematics" };
        var english = new Subject { Name = "English", Code = "ENG101", Description = "English Language" };
        var science = new Subject { Name = "Science", Code = "SCI101", Description = "General Science" };
        var amharic = new Subject { Name = "Amharic", Code = "AMH101", Description = "Amharic Language" };
        db.Subjects.AddRange(math, english, science, amharic);
        await db.SaveChangesAsync();

        // Assign teachers to subjects
        db.SubjectTeachers.AddRange(
            new SubjectTeacher { SubjectId = math.Id, TeacherId = teacher1.Id },
            new SubjectTeacher { SubjectId = science.Id, TeacherId = teacher1.Id },
            new SubjectTeacher { SubjectId = english.Id, TeacherId = teacher2.Id },
            new SubjectTeacher { SubjectId = amharic.Id, TeacherId = teacher2.Id }
        );

        // Assign subjects to classes
        db.ClassSubjects.AddRange(
            new ClassSubject { ClassId = class1.Id, SubjectId = math.Id },
            new ClassSubject { ClassId = class1.Id, SubjectId = english.Id },
            new ClassSubject { ClassId = class1.Id, SubjectId = science.Id },
            new ClassSubject { ClassId = class1.Id, SubjectId = amharic.Id },
            new ClassSubject { ClassId = class2.Id, SubjectId = math.Id },
            new ClassSubject { ClassId = class2.Id, SubjectId = english.Id }
        );
        await db.SaveChangesAsync();

        // Create fee structures
        db.FeeStructures.AddRange(
            new FeeStructure { Name = "Tuition Fee", Amount = 5000, ClassId = class1.Id, Term = "Term 1", AcademicYear = "2024/2025", DueDate = new DateTime(2024, 10, 1) },
            new FeeStructure { Name = "Tuition Fee", Amount = 5500, ClassId = class2.Id, Term = "Term 1", AcademicYear = "2024/2025", DueDate = new DateTime(2024, 10, 1) }
        );

        // Create books
        db.Books.AddRange(
            new Book { Title = "Mathematics Grade 1", Author = "Ministry of Education", ISBN = "978-0-1", Category = "Textbook", Quantity = 30, Available = 28 },
            new Book { Title = "English for Beginners", Author = "Ministry of Education", ISBN = "978-0-2", Category = "Textbook", Quantity = 25, Available = 25 },
            new Book { Title = "General Science", Author = "Ministry of Education", ISBN = "978-0-3", Category = "Textbook", Quantity = 20, Available = 18 },
            new Book { Title = "Amharic Reader", Author = "Ministry of Education", ISBN = "978-0-4", Category = "Textbook", Quantity = 30, Available = 30 },
            new Book { Title = "Story Time Collection", Author = "Various Authors", ISBN = "978-0-5", Category = "Fiction", Quantity = 10, Available = 10 }
        );

        // Create announcements
        db.Announcements.AddRange(
            new Announcement { Title = "Welcome to Golden Academy!", Content = "We welcome all students and parents to the new academic year 2024/2025.", Audience = "ALL" },
            new Announcement { Title = "Parent-Teacher Meeting", Content = "Parent-teacher meeting scheduled for next Friday.", Audience = "PARENTS" }
        );

        await db.SaveChangesAsync();
    }
}
