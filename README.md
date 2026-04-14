# School Management System (SMS) - Golden Academy

A comprehensive web-based school management system built with Angular, .NET API, and MSSQL.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 18 + TypeScript + Tailwind CSS + PrimeNG Icons |
| Backend | .NET 8 Web API (C#) |
| Database | MSSQL with Entity Framework Core ORM |
| Auth | JWT-based with Role-Based Access Control |

## Features

### User Roles
- **Admin** – Full system control
- **Teacher** – Manage classes, grades, attendance
- **Student** – View academic records
- **Parent** – Monitor student progress
- **Accountant** – Manage financial records

### Modules
- **Authentication** – JWT login, registration (admin only), password change
- **Student Management** – CRUD operations, class assignment, parent linking
- **Staff Management** – Teacher profiles, qualifications, subject/class assignments
- **Attendance** – Bulk daily recording, per-student/class reports
- **Academic Management** – Subjects, grades with auto letter-grade calculation, report cards
- **Timetable** – 5-day grid view with time slots, color-coded by subject
- **Fee Management** – Fee structures, payment recording, financial reports
- **Library** – Book inventory, issue/return with automatic fine calculation (5 Birr/day)
- **Communication** – Notifications (send/read/bulk), announcements with audience targeting
- **Reports** – Academic, attendance, financial reports with visual charts
- **Dashboards** – Role-specific dashboards for all 5 user types

## Project Structure

```
├── backend/
│   └── SchoolManagementAPI/
│       ├── Controllers/      # API controllers (13 controllers)
│       ├── Data/             # Entity Framework DbContext
│       ├── DTOs/             # Data Transfer Objects
│       ├── Models/           # Entity models (17 entities)
│       ├── Services/         # JWT service, DB seeder
│       ├── Program.cs        # App configuration
│       └── appsettings.json  # Configuration
├── frontend/
│   └── src/
│       └── app/
│           ├── components/   # Layout component
│           ├── guards/       # Auth guard
│           ├── models/       # TypeScript interfaces
│           ├── pages/        # 14 page components
│           └── services/     # Auth, API, HTTP interceptor
└── README.md
```

## Setup Instructions

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- MSSQL Server (or SQL Server Express)

### Backend Setup
```bash
cd backend/SchoolManagementAPI

# Update connection string in appsettings.json if needed
# Default: Server=localhost;Database=SchoolManagement;Trusted_Connection=True;TrustServerCertificate=True;

# Run the API (auto-creates DB and seeds data)
dotnet run
```
The API starts at `http://localhost:5000` with Swagger UI at `/swagger`.

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
ng serve
```
The frontend starts at `http://localhost:4200`.

## Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Teacher | teacher1 | teacher123 |
| Student | student1 | student123 |
| Parent | parent1 | parent123 |
| Accountant | accountant1 | accountant123 |

## API Endpoints

| Controller | Endpoints |
|-----------|-----------|
| Auth | POST /api/auth/login, POST /api/auth/register, GET /api/auth/me, PUT /api/auth/change-password |
| Students | GET/POST /api/students, GET/PUT/DELETE /api/students/:id |
| Teachers | GET/POST /api/teachers, GET/PUT/DELETE /api/teachers/:id |
| Classes | GET/POST /api/classes, GET/PUT/DELETE /api/classes/:id |
| Subjects | GET/POST /api/subjects, POST /api/subjects/:id/teachers, POST /api/subjects/:id/classes |
| Attendance | GET /api/attendance, POST /api/attendance/bulk, GET /api/attendance/class/:id |
| Grades | GET/POST /api/grades, POST /api/grades/bulk, GET /api/grades/report-card/:id |
| Timetable | GET /api/timetable/class/:id, GET /api/timetable/teacher/:id, POST/PUT/DELETE /api/timetable |
| Fees | GET/POST /api/fees/structures, GET/POST /api/fees/payments, GET /api/fees/student/:id |
| Library | GET/POST /api/library/books, POST /api/library/issue, PUT /api/library/return/:id |
| Notifications | GET/POST /api/notifications, PUT /api/notifications/:id/read |
| Announcements | GET/POST/PUT/DELETE /api/announcements |
| Reports | GET /api/reports/overview, GET /api/reports/fees, GET /api/reports/attendance |
| Dashboard | GET /api/dashboard (role-based response) |
