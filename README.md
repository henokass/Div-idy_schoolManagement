# Golden Academy - School Management System (SMS)

A comprehensive web-based School Management System built for Golden Academy to manage students, staff, academics, finances, and communications.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS v4 + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT with role-based access control

## Features

- **User Authentication** - Secure login with role-based access (Admin, Teacher, Student, Parent, Accountant)
- **Student Management** - Register, view, update, and delete student records
- **Staff Management** - Manage teacher profiles, qualifications, and assignments
- **Attendance Management** - Record and track daily attendance with bulk operations
- **Academic Management** - Subjects, grades, timetables, and report cards
- **Fee Management** - Fee structures, payment recording, financial reports
- **Library Management** - Book inventory, issue/return tracking, fine calculation
- **Communication** - Notifications and announcements system
- **Reports & Analytics** - Academic, attendance, and financial reports

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/henokass/Div-idy_schoolManagement.git
   cd Div-idy_schoolManagement
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your PostgreSQL credentials
   npx prisma migrate dev --name init
   npx prisma db seed
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Demo Accounts

| Role       | Username    | Password      |
|------------|-------------|---------------|
| Admin      | admin       | admin123      |
| Teacher    | teacher1    | teacher123    |
| Student    | student1    | student123    |
| Parent     | parent1     | parent123     |
| Accountant | accountant1 | accountant123 |

## API Endpoints

| Module          | Base URL             | Methods                    |
|-----------------|----------------------|----------------------------|
| Authentication  | `/api/auth`          | POST login, register       |
| Students        | `/api/students`      | GET, POST, PUT, DELETE     |
| Teachers        | `/api/teachers`      | GET, POST, PUT, DELETE     |
| Classes         | `/api/classes`       | GET, POST, PUT, DELETE     |
| Subjects        | `/api/subjects`      | GET, POST, PUT, DELETE     |
| Attendance      | `/api/attendance`    | GET, POST (bulk)           |
| Grades          | `/api/grades`        | GET, POST, PUT, DELETE     |
| Timetable       | `/api/timetable`     | GET, POST, PUT, DELETE     |
| Fees            | `/api/fees`          | GET, POST (structures/payments) |
| Library         | `/api/library`       | GET, POST, PUT (books/issues)   |
| Notifications   | `/api/notifications` | GET, POST, PUT             |
| Announcements   | `/api/announcements` | GET, POST, PUT, DELETE     |
| Reports         | `/api/reports`       | GET                        |
| Dashboard       | `/api/dashboard`     | GET                        |

## Project Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed data
│   ├── src/
│   │   ├── index.ts         # Express server entry
│   │   ├── middleware/       # Auth middleware
│   │   ├── routes/           # API routes
│   │   └── utils/            # Utilities (Prisma client)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Shared components (Layout)
│   │   ├── contexts/         # React contexts (Auth)
│   │   ├── pages/            # Page components
│   │   ├── types/            # TypeScript interfaces
│   │   └── utils/            # API client
│   └── package.json
└── README.md
```

## License

This project is developed for Golden Academy.
