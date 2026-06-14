import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import './MyBids.css';

export default function MyBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyBids().then(res => { setBids(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const stats = {
    total: bids.length,
    pending: bids.filter(b => b.status === 'pending').length,
    accepted: bids.filter(b => b.status === 'accepted').length,
    rejected: bids.filter(b => b.status === 'rejected').length,
  };

  return (
    <div className="page">
      <h1 style={{marginBottom: 6}}>My Bids</h1>
      <p className="text-muted" style={{marginBottom: 24}}>{bids.length} total bids placed</p>

      <div className="bids-stats">
        <div className="bs-item"><span>{stats.total}</span><small>Total</small></div>
        <div className="bs-item orange"><span>{stats.pending}</span><small>Pending</small></div>
        <div className="bs-item green"><span>{stats.accepted}</span><small>Accepted</small></div>
        <div className="bs-item red"><span>{stats.rejected}</span><small>Rejected</small></div>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : bids.length === 0 ? (
        <div className="empty-state">
          <h3>No bids yet</h3>
          <p>Browse projects and submit your first proposal!</p>
          <Link to="/projects" className="btn btn-primary" style={{marginTop: 16}}>Browse Projects</Link>
        </div>
      ) : (
        <div className="my-bids-list">
          {bids.map(bid => (
            <Link to={`/projects/${bid.projectId?._id}`} key={bid._id} className="my-bid-row">
              <div className="mbr-left">
                <span className={`badge badge-${bid.status}`}>{bid.status}</span>
                <div>
                  <div className="mbr-title">{bid.projectId?.title || 'Project deleted'}</div>
                  <div className="mbr-proposal">{bid.proposal.slice(0, 100)}...</div>
                </div>
              </div>
              <div className="mbr-right">
                <span className="mbr-amount">₹{bid.bidAmount?.toLocaleString()}</span>
                <span className="text-muted">{bid.deliveryTime} days</span>
                <span className="text-muted">{new Date(bid.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
