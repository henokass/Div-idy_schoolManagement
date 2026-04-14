import { useEffect, useState } from 'react';
import api from '../utils/api';
import type { Announcement } from '../types';
import { Megaphone, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/announcements').then(res => { setAnnouncements(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (error) { console.error('Error:', error); }
  };

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case 'ALL': return 'bg-indigo-100 text-indigo-700';
      case 'TEACHERS': return 'bg-green-100 text-green-700';
      case 'STUDENTS': return 'bg-blue-100 text-blue-700';
      case 'PARENTS': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 mt-1">{announcements.length} announcements</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
            <Plus size={18} /> New Announcement
          </button>
        )}
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border text-center py-12">
            <Megaphone size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No announcements yet</p>
          </div>
        ) : (
          announcements.map(announcement => (
            <div key={announcement.id} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">{announcement.title}</h2>
                    <span className={`text-xs px-2 py-1 rounded-full ${getAudienceColor(announcement.audience)}`}>{announcement.audience}</span>
                  </div>
                  <p className="text-gray-600">{announcement.content}</p>
                  <p className="text-xs text-gray-400 mt-3">{new Date(announcement.createdAt).toLocaleDateString()}</p>
                </div>
                {user?.role === 'ADMIN' && (
                  <div className="flex items-center gap-1 ml-4">
                    <button className="p-1 hover:bg-gray-100 rounded"><Edit size={16} className="text-blue-500" /></button>
                    <button onClick={() => deleteAnnouncement(announcement.id)} className="p-1 hover:bg-gray-100 rounded"><Trash2 size={16} className="text-red-500" /></button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
