import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Calendar,
  ClipboardList, DollarSign, Library, Bell, Megaphone, BarChart3,
  LogOut, Menu, X, ChevronDown
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT'] },
    { path: '/students', label: 'Students', icon: GraduationCap, roles: ['ADMIN', 'TEACHER'] },
    { path: '/teachers', label: 'Teachers', icon: Users, roles: ['ADMIN'] },
    { path: '/classes', label: 'Classes', icon: BookOpen, roles: ['ADMIN', 'TEACHER'] },
    { path: '/subjects', label: 'Subjects', icon: BookOpen, roles: ['ADMIN', 'TEACHER'] },
    { path: '/attendance', label: 'Attendance', icon: ClipboardList, roles: ['ADMIN', 'TEACHER'] },
    { path: '/grades', label: 'Grades', icon: BarChart3, roles: ['ADMIN', 'TEACHER'] },
    { path: '/timetable', label: 'Timetable', icon: Calendar, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { path: '/fees', label: 'Fees', icon: DollarSign, roles: ['ADMIN', 'ACCOUNTANT'] },
    { path: '/library', label: 'Library', icon: Library, roles: ['ADMIN'] },
    { path: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    { path: '/notifications', label: 'Notifications', icon: Bell, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT'] },
    { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['ADMIN', 'TEACHER', 'ACCOUNTANT'] },
  ];

  const filteredMenu = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} bg-indigo-900 text-white transition-all duration-300 flex flex-col fixed h-full z-30`}>
        <div className="p-4 border-b border-indigo-800">
          <h1 className="text-xl font-bold text-amber-400">Golden Academy</h1>
          <p className="text-xs text-indigo-300 mt-1">School Management System</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {filteredMenu.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-colors ${
                  isActive ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
