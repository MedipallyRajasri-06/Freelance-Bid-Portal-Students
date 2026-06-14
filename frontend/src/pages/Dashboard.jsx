import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      const res = await api.getMyProjects();
      setProjects(res.data);
    } catch {}
    setLoading(false);
  };

  const stats = {
    total: projects.length,
    open: projects.filter(p => p.status === 'open').length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
  };

  return (
    <div className="page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">
            Welcome back, <strong>{user?.name}</strong> ·
            <span className={`role-label role-${user?.role}`}> {user?.role}</span>
          </p>
        </div>
        <div className="dash-actions">
          {user?.role === 'client' && (
            <Link to="/post-project" className="btn btn-primary">+ Post Project</Link>
          )}
          {user?.role === 'student' && (
            <Link to="/projects" className="btn btn-primary">Browse Projects</Link>
          )}
          <Link to="/profile" className="btn btn-ghost">Edit Profile</Link>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-num">{stats.total}</div>
          <div className="stat-card-label">Total {user?.role === 'client' ? 'Posted' : 'Active'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-num green">{stats.open}</div>
          <div className="stat-card-label">Open</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-num orange">{stats.inProgress}</div>
          <div className="stat-card-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-num blue">{stats.completed}</div>
          <div className="stat-card-label">Completed</div>
        </div>
        {user?.role === 'student' && (
          <div className="stat-card">
            <div className="stat-card-num accent">{user?.rating?.toFixed(1) || '—'}</div>
            <div className="stat-card-label">Rating</div>
          </div>
        )}
      </div>

      <h2 className="section-title-sm">
        {user?.role === 'client' ? 'My Projects' : 'Assigned Projects'}
      </h2>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <h3>{user?.role === 'client' ? "No projects yet" : "No active projects"}</h3>
          <p>{user?.role === 'client' ? "Post your first project to get started" : "Bid on projects to start working"}</p>
        </div>
      ) : (
        <div className="dash-projects">
          {projects.map(p => (
            <Link to={`/projects/${p._id}`} key={p._id} className="dash-project-row">
              <div className="dpr-main">
                <span className={`badge badge-${p.status}`}>{p.status.replace('_', ' ')}</span>
                <span className="dpr-title">{p.title}</span>
              </div>
              <div className="dpr-meta">
                <span className="dpr-budget">₹{p.budget?.toLocaleString()}</span>
                <span className="text-muted">{p.deadline} days</span>
                <span className="text-muted">
                  {new Date(p.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
