import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Calendar, FileText, MessageSquare, Star, Users, Stethoscope, LogOut, Pill, FilePlus, CalendarClock } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'doctor', 'patient'] },
    { label: 'Appointments', path: '/appointments', icon: Calendar, roles: ['admin', 'doctor', 'patient'] },
    { label: 'Reports', path: '/reports', icon: FileText, roles: ['admin', 'doctor', 'patient'] },
    { label: 'Messages', path: '/messages', icon: MessageSquare, roles: ['admin', 'doctor', 'patient'] },
    { label: 'Feedback', path: '/feedback', icon: Star, roles: ['admin', 'doctor', 'patient'] },
    { label: 'Doctors', path: '/doctors', icon: Users, roles: ['admin'] },
    { label: 'Services', path: '/services', icon: Stethoscope, roles: ['admin'] },
    { label: 'Medicines', path: '/medicines', icon: Pill, roles: ['patient'] },
    { label: 'Prescribe', path: '/prescriptions/new', icon: FilePlus, roles: ['doctor'] },
    { label: 'Schedule', path: '/schedule', icon: CalendarClock, roles: ['doctor'] },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">M+</div>
        <div className="sidebar-logo-text">MediCare Plus</div>
      </div>

      <nav className="sidebar-nav">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleLogout}
          className="nav-item"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text-muted)' }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
