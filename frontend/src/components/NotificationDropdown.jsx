import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { Bell, Check, CheckCheck, Trash2, Calendar, Star, Pill, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TYPE_ICONS = {
  appointment: Calendar,
  feedback: Star,
  prescription: Pill,
  system: Info,
};

const TYPE_COLORS = {
  appointment: 'var(--primary)',
  feedback: 'var(--amber)',
  prescription: 'var(--emerald)',
  system: 'var(--cyan)',
};

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch unread count on mount and every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.count || 0);
    } catch {
      // silently fail
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications?limit=15');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    if (!open) {
      fetchNotifications();
    }
    setOpen((prev) => !prev);
  };

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      const deleted = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (deleted && !deleted.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {}
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await api.put(`/notifications/${notification._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {}
    }
    if (notification.link) {
      setOpen(false);
      navigate(notification.link);
    }
  };

  return (
    <div className="notif-dropdown-wrapper" ref={dropdownRef}>
      <button
        className="btn-icon notif-bell-btn"
        title="Notifications"
        onClick={toggleDropdown}
        id="notification-bell"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown" id="notification-dropdown">
          {/* Header */}
          <div className="notif-dropdown-header">
            <h3 className="notif-dropdown-title">Notifications</h3>
            <div className="notif-dropdown-actions">
              {unreadCount > 0 && (
                <button
                  className="notif-action-btn"
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                  <span>Read all</span>
                </button>
              )}
              <button
                className="notif-action-btn notif-close-btn"
                onClick={() => setOpen(false)}
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="notif-dropdown-body">
            {loading ? (
              <div className="notif-empty">
                <div className="spinner" style={{ width: 24, height: 24 }} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell size={28} style={{ opacity: 0.3 }} />
                <span>No notifications yet</span>
              </div>
            ) : (
              notifications.map((n) => {
                const IconComp = TYPE_ICONS[n.type] || Info;
                const iconColor = TYPE_COLORS[n.type] || 'var(--text-muted)';
                return (
                  <div
                    key={n._id}
                    className={`notif-item${n.isRead ? '' : ' unread'}`}
                    onClick={() => handleNotificationClick(n)}
                    role="button"
                    tabIndex={0}
                    id={`notification-${n._id}`}
                  >
                    <div
                      className="notif-item-icon"
                      style={{ background: iconColor + '22', color: iconColor }}
                    >
                      <IconComp size={16} />
                    </div>
                    <div className="notif-item-content">
                      <div className="notif-item-title">{n.title}</div>
                      <div className="notif-item-message">{n.message}</div>
                      <div className="notif-item-time">{timeAgo(n.createdAt)}</div>
                    </div>
                    <div className="notif-item-actions">
                      {!n.isRead && (
                        <button
                          className="notif-mini-btn"
                          onClick={(e) => handleMarkRead(n._id, e)}
                          title="Mark as read"
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <button
                        className="notif-mini-btn delete"
                        onClick={(e) => handleDelete(n._id, e)}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
