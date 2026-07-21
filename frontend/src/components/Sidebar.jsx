import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Calendar, FileText, MessageSquare, Star,
  Users, Settings, HelpCircle, PlusCircle, Stethoscope
} from 'lucide-react';

const AVATAR_COLORS = ['#2563eb', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

function getAvatarColor(name = '') {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const patientLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/feedback', icon: Star, label: 'Feedback' },
  ];

  const doctorLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/feedback', icon: Star, label: 'Feedback' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/feedback', icon: Star, label: 'Feedback' },
  ];

  const adminOnlyLinks = [
    { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
    { to: '/services', icon: Settings, label: 'Services' },
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-user">
        <div className="sidebar-user-label">WELCOME BACK</div>
        <div className="sidebar-user-row">
          <div
            className="sidebar-avatar"
            style={{ background: getAvatarColor(user?.name), color: 'white' }}
          >
            {getInitials(user?.name)}
          </div>
          <div className="sidebar-user-name">{user?.name}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="sidebar-section-label">ADMIN</div>
            {adminOnlyLinks.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-help-text">
          Need help?
          <div className="sidebar-help-sub">Message support for quick assistance.</div>
        </div>
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 8 }}
          onClick={() => navigate('/messages')}
        >
          <PlusCircle size={14} />
          New Message
        </button>
      </div>
    </aside>
  );
}
