import { useEffect, useState } from 'react';
import api from '../utils/api';
import type { Subject } from '../types';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      setSubjects(data);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const deleteSubject = async (id: string) => {
    if (!confirm('Delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects(subjects.filter(s => s.id !== id));
    } catch (error) { console.error('Error:', error); }
  };

  const filtered = subjects.filter(s => `${s.name} ${s.code}`.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-500 mt-1">{subjects.length} total subjects</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          <Plus size={18} /> Add Subject
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search subjects..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Teachers</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Classes</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(subject => (
                <tr key={subject.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{subject.name}</p>
                    <p className="text-sm text-gray-500">{subject.description || ''}</p>
                  </td>
                  <td className="px-6 py-4"><span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">{subject.code}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {subject.teachers?.map(t => (
                        <span key={t.teacher.id} className="text-xs text-gray-600">{t.teacher.user?.firstName} {t.teacher.user?.lastName}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{subject._count?.classes || 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded"><Edit size={16} className="text-blue-500" /></button>
                      <button onClick={() => deleteSubject(subject.id)} className="p-1 hover:bg-gray-100 rounded"><Trash2 size={16} className="text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
