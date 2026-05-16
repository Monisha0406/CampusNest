import { Bell, Search, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('students')) return 'Students Management';
    if (path.includes('rooms') || path.includes('room')) return 'Rooms Management';
    if (path.includes('fees')) return 'Fee Records';
    if (path.includes('complaints')) return 'Complaints';
    if (path.includes('profile')) return 'My Profile';
    return 'Welcome';
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1>{getPageTitle()}</h1>
        <p>Welcome back, {user?.name?.split(' ')[0]}</p>
      </div>
      
      <div className="navbar-right">
        <div className="search-input-wrapper" style={{ marginRight: '16px', display: 'none' }}>
           {/* Can add global search here if needed */}
        </div>
        
        <button className="navbar-btn" title="Notifications" onClick={() => toast('Notifications feature coming soon', { icon: '🔔' })}>
          <Bell size={18} />
        </button>
        <button className="navbar-btn" title="Settings" onClick={() => toast('Settings feature coming soon', { icon: '⚙️' })}>
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
