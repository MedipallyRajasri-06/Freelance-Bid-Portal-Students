import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-badge">🎓 Built for Students & Clients</div>
        <h1 className="hero-title">
          Find Talent.<br />
          <span className="gradient-text">Build Your Future.</span>
        </h1>
        <p className="hero-sub">
          A localized marketplace connecting students with real technical gigs.
          Post projects, place bids, track milestones — all in one place.
        </p>
        <div className="hero-actions">
          {!user ? (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
              <Link to="/projects" className="btn btn-outline btn-lg">Browse Projects</Link>
            </>
          ) : (
            <>
              <Link to="/projects" className="btn btn-primary btn-lg">Browse Projects</Link>
              <Link to="/dashboard" className="btn btn-outline btn-lg">My Dashboard</Link>
            </>
          )}
        </div>
      </div>

      <div className="features page">
        <h2 className="section-title">How it works</h2>
        <div className="grid-3">
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Post a Project</h3>
            <p>Clients describe their task, set a budget and deadline, then publish it to student talent.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Students Bid</h3>
            <p>Students browse open projects and submit proposals with their price and delivery timeline.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Milestone Payments</h3>
            <p>Work is tracked in milestones. Clients approve each stage and release payment progressively.</p>
          </div>
        </div>
      </div>

      <div className="stats-bar">
        <div className="page">
          <div className="stats-grid">
            <div className="stat"><span className="stat-num">500+</span><span className="stat-label">Projects Posted</span></div>
            <div className="stat"><span className="stat-num">1200+</span><span className="stat-label">Student Developers</span></div>
            <div className="stat"><span className="stat-num">₹12L+</span><span className="stat-label">Paid Out</span></div>
            <div className="stat"><span className="stat-num">95%</span><span className="stat-label">Satisfaction Rate</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
