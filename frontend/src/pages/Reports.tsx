import { useEffect, useState } from 'react';
import api from '../utils/api';
import { BarChart3, Users, BookOpen } from 'lucide-react';

interface ReportData {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  classDistribution: { name: string; section?: string; students: number }[];
}

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/overview').then(res => { setReportData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">Overview and insights</p>
      </div>

      {reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
              <div className="bg-blue-500 p-3 rounded-lg"><Users size={24} className="text-white" /></div>
              <div><p className="text-sm text-gray-500">Students</p><p className="text-2xl font-bold">{reportData.totalStudents}</p></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
              <div className="bg-green-500 p-3 rounded-lg"><Users size={24} className="text-white" /></div>
              <div><p className="text-sm text-gray-500">Teachers</p><p className="text-2xl font-bold">{reportData.totalTeachers}</p></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
              <div className="bg-purple-500 p-3 rounded-lg"><BookOpen size={24} className="text-white" /></div>
              <div><p className="text-sm text-gray-500">Classes</p><p className="text-2xl font-bold">{reportData.totalClasses}</p></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
              <div className="bg-amber-500 p-3 rounded-lg"><BarChart3 size={24} className="text-white" /></div>
              <div><p className="text-sm text-gray-500">Subjects</p><p className="text-2xl font-bold">{reportData.totalSubjects}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Class Distribution</h2>
            <div className="space-y-3">
              {reportData.classDistribution.map((cls, i) => {
                const maxStudents = Math.max(...reportData.classDistribution.map(c => c.students), 1);
                const percentage = (cls.students / maxStudents) * 100;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{cls.name} {cls.section || ''}</span>
                      <span className="text-sm text-gray-500">{cls.students} students</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className="bg-indigo-600 h-3 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
