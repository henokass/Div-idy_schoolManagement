import { useEffect, useState } from 'react';
import api from '../utils/api';
import type { ClassData } from '../types';
import { Search, Plus, Eye, Edit, Trash2, X, Users } from 'lucide-react';

export default function Classes() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchClasses(); }, []);

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/classes');
      setClasses(data);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const viewClass = async (id: string) => {
    try {
      const { data } = await api.get(`/classes/${id}`);
      setSelectedClass(data);
      setShowModal(true);
    } catch (error) { console.error('Error:', error); }
  };

  const deleteClass = async (id: string) => {
    if (!confirm('Delete this class?')) return;
    try {
      await api.delete(`/classes/${id}`);
      setClasses(classes.filter(c => c.id !== id));
    } catch (error) { console.error('Error:', error); }
  };

  const filtered = classes.filter(c => `${c.name} ${c.section || ''}`.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-500 mt-1">{classes.length} total classes</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          <Plus size={18} /> Add Class
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search classes..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filtered.map(cls => (
            <div key={cls.id} className="border rounded-xl p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{cls.name} {cls.section || ''}</h3>
                <div className="flex items-center gap-1">
                  <button onClick={() => viewClass(cls.id)} className="p-1 hover:bg-gray-100 rounded"><Eye size={16} className="text-gray-500" /></button>
                  <button className="p-1 hover:bg-gray-100 rounded"><Edit size={16} className="text-blue-500" /></button>
                  <button onClick={() => deleteClass(cls.id)} className="p-1 hover:bg-gray-100 rounded"><Trash2 size={16} className="text-red-500" /></button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Users size={14} /> {cls._count?.students || 0} / {cls.capacity} students
              </div>
              {cls.teacher && (
                <p className="text-sm text-gray-500">Class Teacher: {cls.teacher.user?.firstName} {cls.teacher.user?.lastName}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{selectedClass.name} {selectedClass.section || ''} - Details</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div><p className="text-sm text-gray-500">Capacity</p><p className="font-medium">{selectedClass.capacity}</p></div>
                <div><p className="text-sm text-gray-500">Students</p><p className="font-medium">{selectedClass.students?.length || 0}</p></div>
              </div>
              {selectedClass.students && selectedClass.students.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Students</h3>
                  <div className="space-y-2">
                    {selectedClass.students.map(s => (
                      <div key={s.id} className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
                          {s.user?.firstName?.[0]}{s.user?.lastName?.[0]}
                        </div>
                        <span className="text-sm">{s.user?.firstName} {s.user?.lastName}</span>
                      </div>
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
