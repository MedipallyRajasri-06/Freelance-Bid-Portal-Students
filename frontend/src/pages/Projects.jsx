import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import './Projects.css';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', skill: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.skill) params.skill = filter.skill;
      const res = await api.getProjects(params);
      setProjects(res.data);
    } catch {}
    setLoading(false);
  };

  const filtered = projects.filter(p =>
    search ? p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="page">
      <div className="projects-header">
        <div>
          <h1>Browse Projects</h1>
          <p className="text-muted">{filtered.length} projects available</p>
        </div>
      </div>

      <div className="projects-filters">
        <input
          className="search-input"
          placeholder="🔍 Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}>
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select value={filter.skill} onChange={e => setFilter(p => ({ ...p, skill: e.target.value }))}>
          <option value="">All Skills</option>
          {['React', 'Node.js', 'Python', 'Java', 'MongoDB', 'Flutter', 'Machine Learning', 'UI/UX'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No projects found</h3>
          <p>Try adjusting your filters or check back later</p>
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map(project => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project._id}`} className="project-card">
      <div className="project-card-top">
        <span className={`badge badge-${project.status}`}>{project.status.replace('_', ' ')}</span>
        <span className="project-budget">₹{project.budget.toLocaleString()}</span>
      </div>
      <h3 className="project-title">{project.title}</h3>
      <p className="project-desc">{project.description.slice(0, 120)}...</p>
      <div className="project-skills">
        {project.skillsRequired.slice(0, 4).map(s => (
          <span key={s} className="tag">{s}</span>
        ))}
      </div>
      <div className="project-meta">
        <span>⏰ {project.deadline} days</span>
        <span>👤 {project.postedBy?.name}</span>
      </div>
    </Link>
  );
}
