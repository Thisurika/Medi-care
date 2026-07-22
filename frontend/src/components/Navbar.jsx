import { useAuth } from '../context/AuthContext';
import { Bell } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="navbar">
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        Healthcare Management Portal
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <button className="btn-icon" title="Notifications">
          <Bell size={18} />
        </button>

        <div className="user-badge">
          <div className="avatar-circle">
            {getInitials(user?.name)}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{user?.role || 'Guest'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
