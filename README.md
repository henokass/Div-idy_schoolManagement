# School Management System (SMS) - Golden Academy

A comprehensive web-based School Management System built for Golden Academy to manage students, staff, academics, fees, library, and more.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Angular 18 + TypeScript + Tailwind CSS + PrimeNG |
| **Backend** | ASP.NET Core 8 Web API |
| **Database** | MSSQL with Entity Framework Core ORM (In-Memory DB for development) |
| **Auth** | JWT-based with role-based access control |

## User Roles

- **Admin** – Full system control
- **Teacher** – Manage classes, grades, attendance
- **Student** – View academic records
- **Parent** – Monitor student progress
- **Accountant** – Manage financial records

## Features

- **User Authentication** – JWT login with role-based access control
- **Student Management** – CRUD operations, class assignment, academic history
- **Staff Management** – Profiles, departments, payroll tracking
- **Class & Subject Management** – Academic structure organization
- **Attendance Management** – Daily attendance with bulk recording
- **Exam & Grade Management** – Exams, grading, report cards
- **Fee Management** – Fee structures, payment recording, financial reports
- **Library Management** – Book inventory, issue/return, fine calculation
- **Timetable Management** – Class schedules by day
- **Notifications** – Announcements to specific roles
- **Dashboard** – Role-specific overview with stats and charts

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

### Backend Setup

```bash
cd backend/SMS.API
dotnet restore
dotnet run
```

The API will start at `http://localhost:5000` with Swagger UI available at `http://localhost:5000/swagger`.

### Frontend Setup

```bash
cd frontend
npm install
ng serve
```

The Angular app will start at `http://localhost:4200`.

### Default Login Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | Admin@123 | Admin |

## API Endpoints

| Module | Endpoints |
|--------|-----------|
| **Auth** | POST `/api/auth/login`, POST `/api/auth/register` |
| **Students** | GET/POST/PUT/DELETE `/api/students` |
| **Staff** | GET/POST/PUT/DELETE `/api/staff` |
| **Parents** | GET/POST/PUT/DELETE `/api/parents` |
| **Classes** | GET/POST/PUT/DELETE `/api/classes` |
| **Subjects** | GET/POST/PUT/DELETE `/api/subjects` |
| **Attendance** | GET/POST `/api/attendance`, POST `/api/attendance/bulk` |
| **Exams** | GET/POST/PUT/DELETE `/api/exams` |
| **Grades** | GET/POST/PUT/DELETE `/api/grades`, GET `/api/grades/report-card/{id}` |
| **Fees** | GET/POST `/api/fees/structures`, GET/POST `/api/fees/payments` |
| **Library** | GET/POST `/api/library/books`, GET/POST `/api/library/issues` |
| **Timetable** | GET/POST/PUT/DELETE `/api/timetable` |
| **Notifications** | GET/POST `/api/notifications` |
| **Dashboard** | GET `/api/dashboard` |

## Project Structure

```
SchoolManagementSystem/
├── backend/
│   └── SMS.API/
│       ├── Controllers/     # API endpoints
│       ├── Data/            # DbContext
│       ├── DTOs/            # Data Transfer Objects
│       ├── Helpers/         # JWT helper
│       ├── Models/          # Entity models
│       └── Program.cs       # App configuration
├── frontend/
│   └── src/
│       └── app/
│           ├── core/        # Services, guards, interceptors, models
│           └── features/    # Feature components (dashboard, students, etc.)
└── README.md
```

## Database Configuration

By default, the application uses an **in-memory database** for development. To use SQL Server:

1. Update `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your-server;Database=GoldenAcademySMS;Trusted_Connection=true;TrustServerCertificate=true;"
  }
}
```

2. Run migrations:
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## License

This project is built for Golden Academy.
