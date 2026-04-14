import { useEffect, useState } from 'react';
import api from '../utils/api';
import type { Notification as NotificationType } from '../types';
import { Bell, Check, CheckCheck } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) { console.error('Error:', error); }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) { console.error('Error:', error); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800">
            <CheckCheck size={18} /> Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map(notification => (
              <div key={notification.id} className={`px-6 py-4 flex items-start gap-4 ${!notification.isRead ? 'bg-indigo-50/50' : ''}`}>
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-indigo-600' : 'bg-transparent'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{notification.title}</h3>
                    <span className="text-xs text-gray-400">{new Date(notification.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  {notification.sender && (
                    <p className="text-xs text-gray-400 mt-1">From: {notification.sender.firstName} {notification.sender.lastName}</p>
                  )}
                </div>
                {!notification.isRead && (
                  <button onClick={() => markAsRead(notification.id)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600">
                    <Check size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
