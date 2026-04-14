import { useEffect, useState } from 'react';
import api from '../utils/api';
import type { ClassData } from '../types';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  studentId: string;
  student?: { user: { firstName: string; lastName: string } };
}

export default function Attendance() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<{ id: string; user: { firstName: string; lastName: string } }[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get('/classes').then(res => setClasses(res.data)); }, []);

  useEffect(() => {
    if (selectedClass) {
      setLoading(true);
      Promise.all([
        api.get(`/classes/${selectedClass}`),
        api.get(`/attendance/class/${selectedClass}?date=${selectedDate}`),
      ]).then(([classRes, attRes]) => {
        setStudents(classRes.data.students || []);
        setRecords(attRes.data);
        const data: Record<string, string> = {};
        attRes.data.forEach((r: AttendanceRecord) => { data[r.studentId] = r.status; });
        classRes.data.students?.forEach((s: { id: string }) => {
          if (!data[s.id]) data[s.id] = 'PRESENT';
        });
        setAttendanceData(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [selectedClass, selectedDate]);

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const attendanceRecords = Object.entries(attendanceData).map(([studentId, status]) => ({ studentId, status }));
      await api.post('/attendance/bulk', { classId: selectedClass, date: selectedDate, records: attendanceRecords });
      alert('Attendance saved successfully!');
    } catch (error) { console.error('Error:', error); alert('Failed to save attendance'); }
    finally { setSaving(false); }
  };

  const statusIcons: Record<string, React.ReactNode> = {
    PRESENT: <CheckCircle size={16} className="text-green-500" />,
    ABSENT: <XCircle size={16} className="text-red-500" />,
    LATE: <Clock size={16} className="text-amber-500" />,
    EXCUSED: <AlertCircle size={16} className="text-blue-500" />,
  };

  const statusColors: Record<string, string> = {
    PRESENT: 'bg-green-100 text-green-700 border-green-300',
    ABSENT: 'bg-red-100 text-red-700 border-red-300',
    LATE: 'bg-amber-100 text-amber-700 border-amber-300',
    EXCUSED: 'bg-blue-100 text-blue-700 border-blue-300',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-500 mt-1">Record and view daily attendance</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section || ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-400" />
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
        </div>
      </div>

      {selectedClass && !loading && students.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <p className="text-sm text-gray-600">{students.length} students</p>
            <button onClick={saveAttendance} disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
          <div className="divide-y">
            {students.map(student => (
              <div key={student.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-600">
                    {student.user.firstName[0]}{student.user.lastName[0]}
                  </div>
                  <span className="font-medium text-gray-900">{student.user.firstName} {student.user.lastName}</span>
                </div>
                <div className="flex items-center gap-2">
                  {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map(status => (
                    <button key={status} onClick={() => setAttendanceData({ ...attendanceData, [student.id]: status })}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        attendanceData[student.id] === status ? statusColors[status] : 'bg-gray-50 text-gray-400 border-gray-200'
                      }`}>
                      {statusIcons[status]} {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {records.length > 0 && (
            <div className="p-4 bg-gray-50 border-t">
              <p className="text-xs text-gray-500">Attendance already recorded for this date. Saving will update existing records.</p>
            </div>
          )}
        </div>
      )}

      {loading && <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}
    </div>
  );
}
