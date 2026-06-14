import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import toast from 'react-hot-toast';
import './Profile.css';

const SKILLS = ['React', 'Node.js', 'Python', 'Java', 'MongoDB', 'MySQL', 'Flutter', 'Android', 'iOS', 'Vue', 'PHP', 'Django', 'Machine Learning', 'UI/UX', 'Figma', 'DevOps'];

export default function Profile() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const isOwn = !id || id === user?._id;

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      let data;
      if (isOwn) {
        const res = await api.getProfile();
        data = res.data;
      } else {
        const res = await api.getUserById(id);
        data = res.data;
      }
      setProfile(data);
      setForm({ name: data.name, bio: data.bio || '', college: data.college || '', github: data.github || '', portfolioLinks: (data.portfolioLinks || []).join('\n') });
      setSkills(data.skills || []);
    } catch { toast.error('Failed to load profile'); }
    setLoading(false);
  };

  const toggleSkill = (skill) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const portfolioLinks = form.portfolioLinks.split('\n').map(s => s.trim()).filter(Boolean);
      await api.updateProfile({ ...form, skills, portfolioLinks });
      await refreshUser();
      await fetchProfile();
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
    setSaving(false);
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!profile) return <div className="page"><p>Profile not found</p></div>;

  return (
    <div className="page-sm">
      <div className="profile-card card">
        <div className="profile-top">
          <div className="profile-avatar-lg">{profile.name?.[0]?.toUpperCase()}</div>
          <div className="profile-info">
            {editing ? (
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="name-input" />
            ) : (
              <h1 className="profile-name">{profile.name}</h1>
            )}
            <span className={`role-badge role-${profile.role}`}>{profile.role}</span>
            {profile.college && <span className="profile-college">🎓 {profile.college}</span>}
          </div>
          {isOwn && !editing && (
            <button className="btn btn-outline" onClick={() => setEditing(true)}>Edit Profile</button>
          )}
          {isOwn && editing && (
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          )}
        </div>

        {profile.role === 'student' && (
          <div className="profile-stats">
            <div className="ps-item"><span className="ps-val">{profile.completedProjects}</span><span className="ps-label">Projects Done</span></div>
            <div className="ps-item"><span className="ps-val accent">{profile.rating?.toFixed(1) || '—'}</span><span className="ps-label">Rating</span></div>
          </div>
        )}

        <div className="divider" />

        <div className="form-group">
          <label>Bio</label>
          {editing ? (
            <textarea rows={3} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell clients about yourself..." />
          ) : (
            <p className="profile-bio">{profile.bio || <em style={{color:'var(--text3)'}}>No bio yet</em>}</p>
          )}
        </div>

        {editing && (
          <div className="form-group">
            <label>College</label>
            <input value={form.college} onChange={e => setForm(p => ({ ...p, college: e.target.value }))} placeholder="Your college name" />
          </div>
        )}

        <div className="form-group">
          <label>GitHub</label>
          {editing ? (
            <input value={form.github} onChange={e => setForm(p => ({ ...p, github: e.target.value }))} placeholder="https://github.com/yourusername" />
          ) : profile.github ? (
            <a href={profile.github} target="_blank" rel="noreferrer" className="profile-link">🔗 {profile.github}</a>
          ) : (
            <span className="text-muted" style={{fontSize:'0.88rem'}}>Not set</span>
          )}
        </div>

        {profile.role === 'student' && (
          <div className="form-group">
            <label>Skills</label>
            {editing ? (
              <div className="skill-picker">
                {SKILLS.map(s => (
                  <button type="button" key={s}
                    className={`skill-chip ${skills.includes(s) ? 'selected' : ''}`}
                    onClick={() => toggleSkill(s)}>{s}</button>
                ))}
              </div>
            ) : (
              <div className="profile-skills">
                {(profile.skills || []).length > 0
                  ? profile.skills.map(s => <span key={s} className="tag">{s}</span>)
                  : <span className="text-muted" style={{fontSize:'0.88rem'}}>No skills added</span>}
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <label>Portfolio Links</label>
          {editing ? (
            <textarea rows={3} value={form.portfolioLinks}
              onChange={e => setForm(p => ({ ...p, portfolioLinks: e.target.value }))}
              placeholder="One URL per line&#10;https://myproject.com&#10;https://github.com/project" />
          ) : (
            <div className="portfolio-links">
              {(profile.portfolioLinks || []).length > 0
                ? profile.portfolioLinks.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noreferrer" className="profile-link">🔗 {link}</a>
                ))
                : <span className="text-muted" style={{fontSize:'0.88rem'}}>No portfolio links</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
