import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import toast from 'react-hot-toast';
import './PostProject.css';

const SKILLS = ['React', 'Node.js', 'Python', 'Java', 'MongoDB', 'MySQL', 'Flutter', 'Android', 'iOS', 'Vue', 'PHP', 'Django', 'Machine Learning', 'UI/UX', 'Figma', 'DevOps'];

export default function PostProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', budget: '', deadline: '' });
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (skills.length === 0) return toast.error('Add at least one required skill');
    setLoading(true);
    try {
      const res = await api.createProject({ ...form, budget: Number(form.budget), deadline: Number(form.deadline), skillsRequired: skills });
      toast.success('Project posted successfully!');
      navigate(`/projects/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post project');
    }
    setLoading(false);
  };

  return (
    <div className="page-sm">
      <div className="pp-header">
        <h1>Post a Project</h1>
        <p className="text-muted">Describe your task and find the right student developer</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="pp-form">
          <div className="form-group">
            <label>Project Title *</label>
            <input placeholder='e.g. "Need MERN Stack Developer for E-commerce Site"'
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea rows={5}
              placeholder="Describe your project in detail — what needs to be built, technical requirements, expected deliverables..."
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Budget (₹) *</label>
              <input type="number" placeholder="e.g. 5000"
                value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} required min="1" />
            </div>
            <div className="form-group">
              <label>Deadline (days) *</label>
              <input type="number" placeholder="e.g. 7"
                value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} required min="1" />
            </div>
          </div>

          <div className="form-group">
            <label>Skills Required *</label>
            <div className="skill-picker">
              {SKILLS.map(s => (
                <button type="button" key={s}
                  className={`skill-chip ${skills.includes(s) ? 'selected' : ''}`}
                  onClick={() => toggleSkill(s)}>{s}</button>
              ))}
            </div>
            {skills.length > 0 && (
              <p className="skill-selected-label">Selected: {skills.join(', ')}</p>
            )}
          </div>

          <div className="pp-preview card" style={{background: 'var(--bg3)'}}>
            <h4 style={{marginBottom: 8, fontFamily: 'var(--font-display)'}}>Project Summary</h4>
            <div className="preview-grid">
              <span>Budget</span><strong className="green">₹{form.budget || '—'}</strong>
              <span>Deadline</span><strong>{form.deadline ? `${form.deadline} days` : '—'}</strong>
              <span>Skills</span><strong>{skills.length > 0 ? skills.slice(0, 3).join(', ') : '—'}</strong>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Posting...' : '📋 Post Project'}
          </button>
        </form>
      </div>
    </div>
  );
}
