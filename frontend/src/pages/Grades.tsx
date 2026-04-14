import { useEffect, useState } from 'react';
import api from '../utils/api';
import type { Grade } from '../types';
import { Search, BarChart3 } from 'lucide-react';

export default function Grades() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [termFilter, setTermFilter] = useState('');

  useEffect(() => { fetchGrades(); }, []);

  const fetchGrades = async () => {
    try {
      const { data } = await api.get('/grades');
      setGrades(data);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const filtered = grades.filter(g => {
    const matchSearch = `${g.student?.user?.firstName} ${g.student?.user?.lastName} ${g.subject?.name}`.toLowerCase().includes(search.toLowerCase());
    const matchTerm = !termFilter || g.term === termFilter;
    return matchSearch && matchTerm;
  });

  const getGradeColor = (grade?: string) => {
    if (!grade) return 'bg-gray-100 text-gray-700';
    if (grade === 'A+' || grade === 'A') return 'bg-green-100 text-green-700';
    if (grade === 'B') return 'bg-blue-100 text-blue-700';
    if (grade === 'C') return 'bg-amber-100 text-amber-700';
    if (grade === 'D') return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
          <p className="text-gray-500 mt-1">{grades.length} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-indigo-600" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by student or subject..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          </div>
          <select value={termFilter} onChange={(e) => setTermFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">All Terms</option>
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Exam Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Term</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(grade => (
                <tr key={grade.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{grade.student?.user?.firstName} {grade.student?.user?.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{grade.subject?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{grade.examType}</td>
                  <td className="px-6 py-4 text-sm font-medium">{grade.score}/{grade.maxScore}</td>
                  <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(grade.grade)}`}>{grade.grade}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{grade.term} - {grade.academicYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500">No grade records found</div>
          )}
        </div>
      </div>
    </div>
  );
}
