import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { Users, GraduationCap, BookOpen, UserCheck, DollarSign, TrendingUp } from 'lucide-react';

interface DashboardStats {
  students?: number;
  teachers?: number;
  classes?: number;
  parents?: number;
  totalCollected?: number;
  pendingPayments?: number;
}

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface ClassItem {
  id: string;
  name: string;
  section?: string;
  _count?: { students: number };
}

interface SubjectItem {
  subject: { id: string; name: string; code: string };
}

interface GradeItem {
  id: string;
  subject: { name: string };
  score: number;
  maxScore: number;
  grade: string;
}

interface DashboardData {
  stats?: DashboardStats;
  announcements?: AnnouncementItem[];
  teacher?: {
    classes?: ClassItem[];
    subjects?: SubjectItem[];
  };
  student?: {
    class?: { name: string; section?: string };
    grades?: GradeItem[];
  };
  parent?: {
    students?: Array<{
      user: { firstName: string; lastName: string };
      class?: { name: string };
    }>;
  };
  recentPayments?: Array<{
    id: string;
    amountPaid: number;
    student?: { user: { firstName: string; lastName: string } };
  }>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  const stats = data?.stats;
  const announcements = data?.announcements ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.firstName}!</h1>
        <p className="text-gray-500 mt-1">Here&apos;s your dashboard overview</p>
      </div>

      {user?.role === 'ADMIN' && stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={GraduationCap} label="Total Students" value={stats.students ?? 0} color="bg-blue-500" />
          <StatCard icon={Users} label="Total Teachers" value={stats.teachers ?? 0} color="bg-green-500" />
          <StatCard icon={BookOpen} label="Total Classes" value={stats.classes ?? 0} color="bg-purple-500" />
          <StatCard icon={UserCheck} label="Total Parents" value={stats.parents ?? 0} color="bg-amber-500" />
        </div>
      ) : null}

      {user?.role === 'ACCOUNTANT' && stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <StatCard icon={DollarSign} label="Total Collected" value={`${stats.totalCollected ?? 0} Birr`} color="bg-green-500" />
          <StatCard icon={TrendingUp} label="Pending Payments" value={stats.pendingPayments ?? 0} color="bg-red-500" />
        </div>
      ) : null}

      {user?.role === 'TEACHER' && data?.teacher ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Classes</h2>
            {(data.teacher.classes ?? []).map((cls) => (
              <div key={cls.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <span className="font-medium">{cls.name} {cls.section ?? ''}</span>
                <span className="text-sm text-gray-500">{cls._count?.students ?? 0} students</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Subjects</h2>
            {(data.teacher.subjects ?? []).map((s) => (
              <div key={s.subject.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <span className="font-medium">{s.subject.name}</span>
                <span className="text-sm text-gray-500">{s.subject.code}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {user?.role === 'STUDENT' && data?.student ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Class</h2>
            <p className="text-gray-600">{data.student.class?.name} {data.student.class?.section ?? ''}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Grades</h2>
            {(data.student.grades ?? []).map((g) => (
              <div key={g.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm">{g.subject.name}</span>
                <span className="text-sm font-medium">{g.score}/{g.maxScore} ({g.grade})</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Announcements</h2>
        {announcements.length === 0 ? (
          <p className="text-gray-500 text-sm">No announcements yet.</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="py-3 border-b last:border-0">
              <h3 className="font-medium text-gray-900">{a.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{a.content}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
      <div className={`${color} p-3 rounded-lg`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
