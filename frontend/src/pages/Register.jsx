import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const SKILL_OPTIONS = ['React', 'Node.js', 'Python', 'Java', 'MongoDB', 'MySQL', 'Flutter', 'Android', 'iOS', 'Vue', 'Angular', 'PHP', 'Django', 'Machine Learning', 'UI/UX', 'Figma'];

export default function Register() {
  const { registerUser, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', college: '', bio: '' });
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState('');

  const toggleSkill = (skill) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    const res = await registerUser({ ...form, skills });
    if (res.success) {
      toast.success('Account created! Welcome to FreelanceHub 🎉');
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card" style={{ maxWidth: 520 }}>
        <div className="auth-header">
          <div className="auth-icon">🚀</div>
          <h2>Join FreelanceHub</h2>
          <p>Create your account and start earning</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="role-toggle">
            <button type="button"
              className={`role-btn ${form.role === 'student' ? 'active' : ''}`}
              onClick={() => setForm(p => ({ ...p, role: 'student' }))}>
              🎓 I'm a Student
            </button>
            <button type="button"
              className={`role-btn ${form.role === 'client' ? 'active' : ''}`}
              onClick={() => setForm(p => ({ ...p, role: 'client' }))}>
              💼 I'm a Client
            </button>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Full Name</label>
              <input placeholder="Enter FullName" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Min. 6 characters" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
          </div>

          {form.role === 'student' && (
            <>
              <div className="form-group">
                <label>College / University</label>
                <input placeholder="e.g. JNTU Hyderabad" value={form.college}
                  onChange={e => setForm(p => ({ ...p, college: e.target.value }))} />
              </div>

              <div className="form-group">
                <label>Your Skills</label>
                <div className="skill-picker">
                  {SKILL_OPTIONS.map(s => (
                    <button type="button" key={s}
                      className={`skill-chip ${skills.includes(s) ? 'selected' : ''}`}
                      onClick={() => toggleSkill(s)}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Short Bio</label>
                <textarea placeholder="Tell clients about yourself..." value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
