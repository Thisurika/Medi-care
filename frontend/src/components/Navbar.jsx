import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Inbox, ChevronDown } from 'lucide-react';

const AVATAR_COLORS = ['#2563eb', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

function getAvatarColor(name = '') {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <div className="navbar-logo-icon">M+</div>
        <div>
          <div className="navbar-brand">MediCare Plus</div>
          <div className="navbar-sub">Quality healthcare, simplified.</div>
        </div>
      </div>

      {/* Actions */}
      <div className="navbar-actions">
        <button className="notif-btn" title="Notifications">
          <Bell size={17} />
          <span className="notif-dot" />
        </button>

        <button
          className="btn btn-primary"
          style={{ padding: '7px 16px', fontSize: '13px' }}
          onClick={() => navigate('/appointments/new')}
        >
          Book Visit
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => navigate('/messages')}
        >
          <Inbox size={15} />
          Inbox
        </button>

        {/* User Menu */}
        <div
          className="navbar-user"
          onClick={() => { logout(); navigate('/login'); }}
          title="Click to log out"
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: getAvatarColor(user?.name),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: 'white',
              flexShrink: 0,
            }}
          >
            {getInitials(user?.name)}
          </div>
          <div>
            <div className="navbar-user-name">{user?.name}</div>
            <div className="navbar-user-role">{user?.role}</div>
          </div>
          <ChevronDown size={13} color="var(--text-muted)" />
        </div>
      </div>
    </header>
  );
}
