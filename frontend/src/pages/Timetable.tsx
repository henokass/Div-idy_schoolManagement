import { useEffect, useState } from 'react';
import api from '../utils/api';
import type { TimetableSlot, ClassData } from '../types';
import { Clock } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const COLORS = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800', 'bg-amber-100 text-amber-800', 'bg-rose-100 text-rose-800', 'bg-cyan-100 text-cyan-800'];

export default function Timetable() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get('/classes').then(res => setClasses(res.data)); }, []);

  useEffect(() => {
    if (selectedClass) {
      setLoading(true);
      api.get(`/timetable/class/${selectedClass}`).then(res => { setSlots(res.data); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [selectedClass]);

  const getSlotsByDay = (day: string) => slots.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const getSubjectColor = (subjectId: string) => {
    const subjects = [...new Set(slots.map(s => s.subjectId))];
    return COLORS[subjects.indexOf(subjectId) % COLORS.length];
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
        <p className="text-gray-500 mt-1">Class schedules and timetables</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="">Select Class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section || ''}</option>)}
        </select>
      </div>

      {loading && <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}

      {selectedClass && !loading && (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          {slots.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No timetable entries for this class yet.</p>
            </div>
          ) : (
            <div className="min-w-[800px]">
              <div className="grid grid-cols-5 gap-px bg-gray-200">
                {DAYS.map(day => (
                  <div key={day} className="bg-indigo-50 px-4 py-3 text-center font-semibold text-indigo-900">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-px bg-gray-200 min-h-[400px]">
                {DAYS.map(day => (
                  <div key={day} className="bg-white p-2 space-y-2">
                    {getSlotsByDay(day).map(slot => (
                      <div key={slot.id} className={`rounded-lg p-3 ${getSubjectColor(slot.subjectId)}`}>
                        <p className="font-medium text-sm">{slot.subject?.name}</p>
                        <p className="text-xs mt-1">{slot.startTime} - {slot.endTime}</p>
                        {slot.teacher && <p className="text-xs mt-1">{slot.teacher.user?.firstName} {slot.teacher.user?.lastName}</p>}
                        {slot.room && <p className="text-xs">Room: {slot.room}</p>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
