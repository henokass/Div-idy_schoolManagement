import { PrismaClient, Role, Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@goldenacademy.edu',
      password: adminPassword,
      role: Role.ADMIN,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+251911000000',
    },
  });
  console.log('Admin user created:', admin.username);

  // Create teacher users
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const teacherUser1 = await prisma.user.upsert({
    where: { username: 'teacher1' },
    update: {},
    create: {
      username: 'teacher1',
      email: 'abebe.kebede@goldenacademy.edu',
      password: teacherPassword,
      role: Role.TEACHER,
      firstName: 'Abebe',
      lastName: 'Kebede',
      phone: '+251911111111',
    },
  });

  const teacherUser2 = await prisma.user.upsert({
    where: { username: 'teacher2' },
    update: {},
    create: {
      username: 'teacher2',
      email: 'tigist.haile@goldenacademy.edu',
      password: teacherPassword,
      role: Role.TEACHER,
      firstName: 'Tigist',
      lastName: 'Haile',
      phone: '+251911222222',
    },
  });

  // Create teacher profiles
  const teacher1 = await prisma.teacher.upsert({
    where: { userId: teacherUser1.id },
    update: {},
    create: {
      userId: teacherUser1.id,
      employeeId: 'EMP001',
      dateOfBirth: new Date('1985-03-15'),
      gender: Gender.MALE,
      qualification: 'M.Ed in Mathematics',
      salary: 15000,
    },
  });

  const teacher2 = await prisma.teacher.upsert({
    where: { userId: teacherUser2.id },
    update: {},
    create: {
      userId: teacherUser2.id,
      employeeId: 'EMP002',
      dateOfBirth: new Date('1990-07-20'),
      gender: Gender.FEMALE,
      qualification: 'B.Ed in English',
      salary: 12000,
    },
  });

  // Create parent user
  const parentPassword = await bcrypt.hash('parent123', 10);
  const parentUser = await prisma.user.upsert({
    where: { username: 'parent1' },
    update: {},
    create: {
      username: 'parent1',
      email: 'worku.tesfaye@gmail.com',
      password: parentPassword,
      role: Role.PARENT,
      firstName: 'Worku',
      lastName: 'Tesfaye',
      phone: '+251911333333',
    },
  });

  const parent = await prisma.parent.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: {
      userId: parentUser.id,
      occupation: 'Engineer',
      address: 'Addis Ababa, Bole',
    },
  });

  // Create subjects
  const math = await prisma.subject.upsert({
    where: { code: 'MATH101' },
    update: {},
    create: { name: 'Mathematics', code: 'MATH101', description: 'Basic Mathematics' },
  });

  const english = await prisma.subject.upsert({
    where: { code: 'ENG101' },
    update: {},
    create: { name: 'English', code: 'ENG101', description: 'English Language' },
  });

  const science = await prisma.subject.upsert({
    where: { code: 'SCI101' },
    update: {},
    create: { name: 'Science', code: 'SCI101', description: 'General Science' },
  });

  const amharic = await prisma.subject.upsert({
    where: { code: 'AMH101' },
    update: {},
    create: { name: 'Amharic', code: 'AMH101', description: 'Amharic Language' },
  });

  // Create classes
  const class1A = await prisma.class.upsert({
    where: { name_section: { name: 'Grade 1', section: 'A' } },
    update: {},
    create: { name: 'Grade 1', section: 'A', capacity: 40, teacherId: teacher1.id },
  });

  const class2A = await prisma.class.upsert({
    where: { name_section: { name: 'Grade 2', section: 'A' } },
    update: {},
    create: { name: 'Grade 2', section: 'A', capacity: 35, teacherId: teacher2.id },
  });

  // Assign subjects to classes
  for (const subject of [math, english, science, amharic]) {
    for (const cls of [class1A, class2A]) {
      await prisma.classSubject.upsert({
        where: { classId_subjectId: { classId: cls.id, subjectId: subject.id } },
        update: {},
        create: { classId: cls.id, subjectId: subject.id },
      });
    }
  }

  // Assign teachers to subjects
  await prisma.subjectTeacher.upsert({
    where: { subjectId_teacherId: { subjectId: math.id, teacherId: teacher1.id } },
    update: {},
    create: { subjectId: math.id, teacherId: teacher1.id },
  });
  await prisma.subjectTeacher.upsert({
    where: { subjectId_teacherId: { subjectId: science.id, teacherId: teacher1.id } },
    update: {},
    create: { subjectId: science.id, teacherId: teacher1.id },
  });
  await prisma.subjectTeacher.upsert({
    where: { subjectId_teacherId: { subjectId: english.id, teacherId: teacher2.id } },
    update: {},
    create: { subjectId: english.id, teacherId: teacher2.id },
  });
  await prisma.subjectTeacher.upsert({
    where: { subjectId_teacherId: { subjectId: amharic.id, teacherId: teacher2.id } },
    update: {},
    create: { subjectId: amharic.id, teacherId: teacher2.id },
  });

  // Create student users
  const studentPassword = await bcrypt.hash('student123', 10);
  const studentNames = [
    { first: 'Dawit', last: 'Worku', gender: Gender.MALE },
    { first: 'Sara', last: 'Bekele', gender: Gender.FEMALE },
    { first: 'Yonas', last: 'Tadesse', gender: Gender.MALE },
    { first: 'Hana', last: 'Getachew', gender: Gender.FEMALE },
    { first: 'Nahom', last: 'Alemu', gender: Gender.MALE },
  ];

  for (let i = 0; i < studentNames.length; i++) {
    const s = studentNames[i];
    const username = `student${i + 1}`;
    const studentUser = await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        username,
        email: `${s.first.toLowerCase()}.${s.last.toLowerCase()}@goldenacademy.edu`,
        password: studentPassword,
        role: Role.STUDENT,
        firstName: s.first,
        lastName: s.last,
        phone: `+25191${String(i + 4).padStart(7, '0')}`,
      },
    });

    await prisma.student.upsert({
      where: { userId: studentUser.id },
      update: {},
      create: {
        userId: studentUser.id,
        admissionNumber: `GA2024${String(i + 1).padStart(3, '0')}`,
        dateOfBirth: new Date(`201${5 + (i % 3)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`),
        gender: s.gender,
        classId: i < 3 ? class1A.id : class2A.id,
        parentId: i === 0 ? parent.id : undefined,
      },
    });
  }

  // Create accountant user
  const accountantPassword = await bcrypt.hash('accountant123', 10);
  await prisma.user.upsert({
    where: { username: 'accountant1' },
    update: {},
    create: {
      username: 'accountant1',
      email: 'finance@goldenacademy.edu',
      password: accountantPassword,
      role: Role.ACCOUNTANT,
      firstName: 'Meron',
      lastName: 'Assefa',
      phone: '+251911888888',
    },
  });

  // Create fee structures
  await prisma.feeStructure.create({
    data: {
      name: 'Tuition Fee',
      amount: 5000,
      description: 'Term 1 tuition fee',
      classId: class1A.id,
      term: 'Term 1',
      academicYear: '2024/2025',
      dueDate: new Date('2024-10-15'),
    },
  });

  await prisma.feeStructure.create({
    data: {
      name: 'Tuition Fee',
      amount: 5500,
      description: 'Term 1 tuition fee',
      classId: class2A.id,
      term: 'Term 1',
      academicYear: '2024/2025',
      dueDate: new Date('2024-10-15'),
    },
  });

  // Create some books
  const books = [
    { title: 'Mathematics Grade 1', author: 'MOE Ethiopia', isbn: '978-1-001', category: 'Textbook', quantity: 20 },
    { title: 'English for Beginners', author: 'MOE Ethiopia', isbn: '978-1-002', category: 'Textbook', quantity: 20 },
    { title: 'General Science', author: 'MOE Ethiopia', isbn: '978-1-003', category: 'Textbook', quantity: 15 },
    { title: 'Amharic Literature', author: 'MOE Ethiopia', isbn: '978-1-004', category: 'Textbook', quantity: 15 },
    { title: 'The Little Prince', author: 'Antoine de Saint-Exupery', isbn: '978-0-156', category: 'Fiction', quantity: 5 },
  ];

  for (const book of books) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {},
      create: { ...book, available: book.quantity },
    });
  }

  // Create announcements
  await prisma.announcement.create({
    data: {
      title: 'Welcome to Golden Academy 2024/2025',
      content: 'We are pleased to welcome all students, parents, and staff to the new academic year. Let us work together for academic excellence!',
      audience: 'ALL',
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Parent-Teacher Conference',
      content: 'The first parent-teacher conference will be held on November 15, 2024. All parents are encouraged to attend.',
      audience: 'PARENTS',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
