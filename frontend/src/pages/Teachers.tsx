import { useEffect, useState } from 'react';
import api from '../utils/api';
import type { Teacher } from '../types';
import { Search, Plus, Eye, Edit, Trash2, X } from 'lucide-react';

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/teachers');
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTeacher = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await api.delete(`/teachers/${id}`);
      setTeachers(teachers.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting teacher:', error);
    }
  };

  const viewTeacher = async (id: string) => {
    try {
      const { data } = await api.get(`/teachers/${id}`);
      setSelectedTeacher(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filtered = teachers.filter(t =>
    `${t.user.firstName} ${t.user.lastName} ${t.employeeId}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-500 mt-1">{teachers.length} total teachers</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          <Plus size={18} /> Add Teacher
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search teachers..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Qualification</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Subjects</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(teacher => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-600">
                        {teacher.user.firstName[0]}{teacher.user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{teacher.user.firstName} {teacher.user.lastName}</p>
                        <p className="text-sm text-gray-500">{teacher.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{teacher.employeeId}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{teacher.qualification || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects?.map(s => (
                        <span key={s.subject.id} className="inline-flex px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">{s.subject.name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => viewTeacher(teacher.id)} className="p-1 hover:bg-gray-100 rounded"><Eye size={16} className="text-gray-500" /></button>
                      <button className="p-1 hover:bg-gray-100 rounded"><Edit size={16} className="text-blue-500" /></button>
                      <button onClick={() => deleteTeacher(teacher.id)} className="p-1 hover:bg-gray-100 rounded"><Trash2 size={16} className="text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Teacher Details</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{selectedTeacher.user.firstName} {selectedTeacher.user.lastName}</p></div>
                <div><p className="text-sm text-gray-500">Employee ID</p><p className="font-medium">{selectedTeacher.employeeId}</p></div>
                <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{selectedTeacher.user.email}</p></div>
                <div><p className="text-sm text-gray-500">Qualification</p><p className="font-medium">{selectedTeacher.qualification || '-'}</p></div>
                <div><p className="text-sm text-gray-500">Gender</p><p className="font-medium">{selectedTeacher.gender}</p></div>
                <div><p className="text-sm text-gray-500">Join Date</p><p className="font-medium">{new Date(selectedTeacher.joinDate).toLocaleDateString()}</p></div>
              </div>
              {selectedTeacher.classes && selectedTeacher.classes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Classes</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.classes.map(c => (
                      <span key={c.id} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">{c.name} {c.section || ''}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
