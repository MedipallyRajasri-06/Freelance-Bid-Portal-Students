import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) fetchNotifs();
  }, [user, location.pathname]);

  const fetchNotifs = async () => {
    try {
      const res = await api.getNotifications();
      setNotifs(res.data);
    } catch {}
  };

  const unread = notifs.filter(n => !n.read).length;

  const handleMarkAll = async () => {
    await api.markAllRead();
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkSingleRead = async (notifId) => {
    try {
      await api.markRead(notifId);
      setNotifs(prev => prev.map(n => n._id === notifId ? { ...n, read: true } : n));
    } catch {}
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⚡</span>
          <span>FreelanceHub</span>
        </Link>

        <div className="navbar-links">
          <Link to="/projects" className={location.pathname === '/projects' ? 'active' : ''}>Browse</Link>
          {user?.role === 'client' && (
            <Link to="/post-project" className={location.pathname === '/post-project' ? 'active' : ''}>Post Project</Link>
          )}
          {user && (
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
          )}
          {user?.role === 'student' && (
            <Link to="/my-bids" className={location.pathname === '/my-bids' ? 'active' : ''}>My Bids</Link>
          )}
        </div>

        <div className="navbar-right">
          {user ? (
            <>
              <div className="notif-wrapper">
                <button className="notif-btn" onClick={() => setShowNotifs(v => !v)}>
                  🔔
                  {unread > 0 && <span className="notif-badge">{unread}</span>}
                </button>
                {showNotifs && (
                  <div className="notif-dropdown">
                    <div className="notif-header">
                      <span>Notifications</span>
                      <div className="notif-header-actions">
                        {unread > 0 && <button onClick={handleMarkAll} className="mark-all">Mark all read</button>}
                        <button className="notif-close" onClick={() => setShowNotifs(false)}>✕</button>
                      </div>
                    </div>
                    {notifs.length === 0 ? (
                      <div className="notif-empty">No notifications yet</div>
                    ) : (
                      notifs.slice(0, 8).map(n => (
                        <div key={n._id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                          <div className="notif-content">
                            <span>{n.message}</span>
                            <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                          {!n.read && (
                            <button
                              className="notif-read-dot"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkSingleRead(n._id);
                              }}
                              title="Mark as read"
                            />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <Link to="/profile" className="user-chip">
                <span className="user-avatar">{user.name?.[0]?.toUpperCase()}</span>
                <span className="user-name">{user.name?.split(' ')[0]}</span>
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
