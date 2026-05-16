import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, BedDouble, CreditCard,
  MessageSquareWarning, User, LogOut, Building2
} from 'lucide-react';

const adminNav = [
  { section: 'Overview', items: [{ to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' }] },
  {
    section: 'Management', items: [
      { to: '/admin/students', icon: Users, label: 'Students' },
      { to: '/admin/rooms', icon: BedDouble, label: 'Rooms' },
      { to: '/admin/fees', icon: CreditCard, label: 'Fees' },
      { to: '/admin/complaints', icon: MessageSquareWarning, label: 'Complaints' },
    ]
  },
];

const studentNav = [
  { section: 'My Account', items: [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/profile', icon: User, label: 'My Profile' },
    { to: '/student/room', icon: BedDouble, label: 'My Room' },
    { to: '/student/fees', icon: CreditCard, label: 'My Fees' },
    { to: '/student/complaints', icon: MessageSquareWarning, label: 'Complaints' },
  ]}
];

export default function Sidebar({ pendingComplaints }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const nav = isAdmin ? adminNav : studentNav;

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏠</div>
        <div className="sidebar-logo-text">
          <h2>SmartStay</h2>
          <span>Hostel Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {nav.map(group => (
          <div key={group.section}>
            <div className="sidebar-section-title">{group.section}</div>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
              >
                <item.icon size={18} />
                {item.label}
                {item.label === 'Complaints' && pendingComplaints > 0 && (
                  <span className="sidebar-badge">{pendingComplaints}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <p>{user?.name}</p>
            <span>{user?.role === 'admin' ? 'Administrator' : 'Student'}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
