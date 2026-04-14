import { useEffect, useState } from 'react';
import api from '../utils/api';
import type { Student } from '../types';
import { Search, Plus, Eye, Edit, Trash2, X } from 'lucide-react';

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/students');
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents(students.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const viewStudent = async (id: string) => {
    try {
      const { data } = await api.get(`/students/${id}`);
      setSelectedStudent(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching student:', error);
    }
  };

  const filtered = students.filter(s =>
    `${s.user.firstName} ${s.user.lastName} ${s.admissionNumber}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 mt-1">{students.length} total students</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          <Plus size={18} /> Add Student
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Admission #</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Gender</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(student => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-600">
                        {student.user.firstName[0]}{student.user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.user.firstName} {student.user.lastName}</p>
                        <p className="text-sm text-gray-500">{student.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.admissionNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.class?.name} {student.class?.section || ''}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.gender}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${student.user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {student.user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => viewStudent(student.id)} className="p-1 hover:bg-gray-100 rounded"><Eye size={16} className="text-gray-500" /></button>
                      <button className="p-1 hover:bg-gray-100 rounded"><Edit size={16} className="text-blue-500" /></button>
                      <button onClick={() => deleteStudent(student.id)} className="p-1 hover:bg-gray-100 rounded"><Trash2 size={16} className="text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Student Details</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{selectedStudent.user.firstName} {selectedStudent.user.lastName}</p></div>
                <div><p className="text-sm text-gray-500">Admission #</p><p className="font-medium">{selectedStudent.admissionNumber}</p></div>
                <div><p className="text-sm text-gray-500">Class</p><p className="font-medium">{selectedStudent.class?.name} {selectedStudent.class?.section || ''}</p></div>
                <div><p className="text-sm text-gray-500">Gender</p><p className="font-medium">{selectedStudent.gender}</p></div>
                <div><p className="text-sm text-gray-500">Date of Birth</p><p className="font-medium">{new Date(selectedStudent.dateOfBirth).toLocaleDateString()}</p></div>
                <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{selectedStudent.user.email}</p></div>
              </div>
              {selectedStudent.grades && selectedStudent.grades.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Recent Grades</h3>
                  <div className="space-y-2">
                    {selectedStudent.grades.map(g => (
                      <div key={g.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                        <span className="text-sm">{g.subject?.name} - {g.examType}</span>
                        <span className="font-medium text-sm">{g.score}/{g.maxScore} ({g.grade})</span>
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
