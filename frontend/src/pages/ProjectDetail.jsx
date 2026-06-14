import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import toast from 'react-hot-toast';
import ChatBox from '../components/ChatBox';
import './ProjectDetail.css';

/* ─── Payment Modal ─────────────────────────────────────────────────── */
function PaymentModal({ milestone, onClose, onConfirmPayment }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>💳 Complete Payment</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="payment-info-box">
            <p className="payment-label">Milestone</p>
            <p className="payment-milestone-title">{milestone.title}</p>
            <p className="payment-label" style={{ marginTop: 12 }}>Amount to Pay</p>
            <p className="payment-amount">₹{milestone.amount.toLocaleString()}</p>
          </div>

          {milestone.paymentScanner ? (
            <>
              <p className="payment-label" style={{ marginTop: 16, marginBottom: 8 }}>
                Bidder's Payment Scanner / QR Code
              </p>
              <div className="scanner-preview-wrap">
                <img
                  src={milestone.paymentScanner}
                  alt="Payment Scanner"
                  className="scanner-preview-img"
                />
              </div>
              <p className="payment-hint">
                Scan the QR code above and pay <strong>₹{milestone.amount.toLocaleString()}</strong> to the bidder,
                then click <em>Confirm Payment & Approve</em>.
              </p>
              <div className="modal-actions">
                <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                <button className="btn btn-success" onClick={() => onConfirmPayment(milestone._id)}>
                  ✅ Confirm Payment & Approve
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="payment-incomplete-banner">
                <span className="pi-icon">⚠️</span>
                <div>
                  <p className="pi-title">Payment Incomplete</p>
                  <p className="pi-desc">
                    The bidder has not uploaded their payment scanner/QR code yet.
                    Payment cannot be confirmed until the bidder provides their scanner.
                  </p>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={onClose}>OK, Got It</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Scanner Upload Modal (for bidder) ────────────────────────────── */
function ScannerUploadModal({ milestone, onClose, onUploaded }) {
  const [preview, setPreview] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('File too large (max 2MB)'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setFileData(ev.target.result);
      setFileType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileData) { toast.error('Please select an image first'); return; }
    setUploading(true);
    try {
      await api.uploadPaymentScanner(milestone._id, { scannerData: fileData, scannerType: fileType });
      toast.success('Payment scanner uploaded! Client will now be able to pay.');
      onUploaded();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setUploading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📤 Upload Payment Scanner</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="payment-info-box">
            <p className="payment-label">Milestone</p>
            <p className="payment-milestone-title">{milestone.title}</p>
            <p className="payment-label" style={{ marginTop: 12 }}>Expected Payment</p>
            <p className="payment-amount">₹{milestone.amount.toLocaleString()}</p>
          </div>
          <p className="payment-hint" style={{ marginTop: 12 }}>
            Upload your UPI QR code or payment scanner so the client can pay
            <strong> ₹{milestone.amount.toLocaleString()}</strong> before this milestone is approved.
          </p>

          {milestone.paymentScanner ? (
            <>
              <p className="payment-label" style={{ marginTop: 16, marginBottom: 6 }}>Current Scanner (uploaded)</p>
              <div className="scanner-preview-wrap">
                <img src={milestone.paymentScanner} alt="Uploaded Scanner" className="scanner-preview-img" />
              </div>
              <p style={{ color: 'var(--success, #22c55e)', marginTop: 8, fontSize: '0.85rem' }}>
                ✅ Scanner already uploaded. Waiting for client to pay.
              </p>
            </>
          ) : null}

          <div className="upload-area" onClick={() => fileRef.current.click()}>
            {preview ? (
              <img src={preview} alt="Preview" className="upload-preview-img" />
            ) : (
              <>
                <span className="upload-icon">🖼️</span>
                <p>Click to select QR / Scanner image</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>PNG, JPG, JPEG — max 2MB</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

          <div className="modal-actions">
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading || !fileData}>
              {uploading ? 'Uploading...' : 'Upload Scanner'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────── */
export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bid form
  const [bidForm, setBidForm] = useState({ bidAmount: '', proposal: '', deliveryTime: '' });
  const [bidLoading, setBidLoading] = useState(false);

  // Milestone form
  const [msForm, setMsForm] = useState({ title: '', amount: '' });
  const [msLoading, setMsLoading] = useState(false);

  // Modals
  const [paymentModal, setPaymentModal] = useState(null);    // milestone object
  const [scannerModal, setScannerModal] = useState(null);    // milestone object

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [projRes] = await Promise.all([api.getProjectById(id)]);
      setProject(projRes.data);
      if (user) {
        const bidsRes = await api.getProjectBids(id);
        setBids(bidsRes.data);
        const msRes = await api.getProjectMilestones(id);
        setMilestones(msRes.data);
      }
    } catch { toast.error('Failed to load project'); }
    setLoading(false);
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setBidLoading(true);
    try {
      await api.placeBid({ ...bidForm, projectId: id });
      toast.success('Bid submitted!');
      setBidForm({ bidAmount: '', proposal: '', deliveryTime: '' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place bid');
    }
    setBidLoading(false);
  };

  const handleAcceptBid = async (bidId) => {
    try {
      await api.acceptBid(bidId);
      toast.success('Bid accepted! Project started 🚀');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept bid');
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    setMsLoading(true);
    try {
      await api.createMilestone({ ...msForm, projectId: id });
      toast.success('Milestone added!');
      setMsForm({ title: '', amount: '' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add milestone');
    }
    setMsLoading(false);
  };

  const handleCompleteMilestone = async (msId) => {
    try {
      await api.completeMilestone(msId);
      toast.success('Milestone marked as complete!');
      fetchAll();
    } catch (err) { toast.error('Failed'); }
  };

  // Client clicks "Approve & Pay" → open payment modal
  const handleOpenPayment = (ms) => {
    setPaymentModal(ms);
  };

  // Client confirms payment inside modal
  const handleConfirmPayment = async (msId) => {
    try {
      const res = await api.approveMilestone(msId);
      toast.success('Payment confirmed! Milestone approved 💰');
      if (res.data.projectCompleted) toast.success('🎉 Project fully completed!');
      setPaymentModal(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  // Bidder uploads scanner then re-fetch
  const handleScannerUploaded = () => {
    setScannerModal(null);
    fetchAll();
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.deleteProject(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!project) return <div className="page"><p>Project not found</p></div>;

  const isClient = user?._id === project.postedBy?._id;
  const isAssignedStudent = user?._id === project.assignedTo?._id;
  const myBid = bids.find(b => b.studentId?._id === user?._id);
  const totalMilestones = milestones.reduce((sum, m) => sum + m.amount, 0);
  const approved = milestones.filter(m => m.status === 'approved').reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="page">
      {/* Payment modal for client */}
      {paymentModal && (
        <PaymentModal
          milestone={paymentModal}
          onClose={() => setPaymentModal(null)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {/* Scanner upload modal for bidder */}
      {scannerModal && (
        <ScannerUploadModal
          milestone={scannerModal}
          onClose={() => setScannerModal(null)}
          onUploaded={handleScannerUploaded}
        />
      )}

      <div className="project-detail-layout">
        <div className="project-main">
          <div className="project-detail-header card">
            <div className="pdh-top">
              <span className={`badge badge-${project.status}`}>{project.status.replace('_', ' ')}</span>
              {isClient && project.status === 'open' && (
                <div className="pdh-actions">
                  <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>Delete</button>
                </div>
              )}
            </div>
            <h1 className="pd-title">{project.title}</h1>
            <p className="pd-desc">{project.description}</p>
            <div className="pd-skills">
              {project.skillsRequired.map(s => <span key={s} className="tag">{s}</span>)}
            </div>
            <div className="pd-meta-row">
              <div className="pd-meta-item">
                <span className="meta-label">Budget</span>
                <span className="meta-val green">₹{project.budget?.toLocaleString()}</span>
              </div>
              <div className="pd-meta-item">
                <span className="meta-label">Deadline</span>
                <span className="meta-val">{project.deadline} days</span>
              </div>
              <div className="pd-meta-item">
                <span className="meta-label">Posted by</span>
                <span className="meta-val">{project.postedBy?.name}</span>
              </div>
              <div className="pd-meta-item">
                <span className="meta-label">Bids</span>
                <span className="meta-val">{bids.length}</span>
              </div>
            </div>
          </div>

          {/* Milestones */}
          {(project.status !== 'open' || isClient) && (
            <div className="card mt-20">
              <div className="section-header">
                <h3>Milestones</h3>
                <span className="text-muted">₹{approved.toLocaleString()} / ₹{totalMilestones.toLocaleString()} paid</span>
              </div>

              {milestones.length === 0 ? (
                <p className="text-muted" style={{ marginBottom: 12 }}>No milestones yet.</p>
              ) : (
                <div className="milestones-list">
                  {milestones.map(ms => (
                    <div key={ms._id} className={`milestone-item ${ms.status === 'approved' ? 'ms-approved' : ''}`}>
                      <div className="ms-info">
                        <span className="ms-title">{ms.title}</span>
                        <div className="ms-badges">
                          <span className={`badge badge-${ms.status}`}>
                            {ms.status === 'approved' ? '✅ Paid & Approved'
                              : ms.status === 'completed' ? '🔄 Awaiting Payment'
                              : ms.status.replace('_', ' ')}
                          </span>
                          {ms.status === 'completed' && !ms.paymentScanner && (
                            <span className="badge badge-warning">⚠️ Scanner Needed</span>
                          )}
                          {ms.status === 'completed' && ms.paymentScanner && (
                            <span className="badge badge-info">🔍 Scanner Ready</span>
                          )}
                        </div>
                      </div>
                      <div className="ms-right">
                        <span className={`ms-amount ${ms.status === 'approved' ? 'ms-amount-paid' : ''}`}>
                          ₹{ms.amount.toLocaleString()}
                        </span>

                        {/* Bidder: mark complete */}
                        {isAssignedStudent && ms.status === 'pending' && (
                          <button className="btn btn-outline btn-sm" onClick={() => handleCompleteMilestone(ms._id)}>
                            Mark Complete
                          </button>
                        )}

                        {/* Bidder: upload scanner (when milestone is completed) */}
                        {isAssignedStudent && ms.status === 'completed' && (
                          <button
                            className={`btn btn-sm ${ms.paymentScanner ? 'btn-outline' : 'btn-primary'}`}
                            onClick={() => setScannerModal(ms)}
                          >
                            {ms.paymentScanner ? '🔄 Update Scanner' : '📤 Upload Scanner'}
                          </button>
                        )}

                        {/* Client: approve & pay (only when completed) */}
                        {isClient && ms.status === 'completed' && (
                          <button
                            className={`btn btn-sm ${ms.paymentScanner ? 'btn-success' : 'btn-warning'}`}
                            onClick={() => handleOpenPayment(ms)}
                          >
                            {ms.paymentScanner ? '💳 Pay & Approve' : '⚠️ Payment Incomplete'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isClient && project.status === 'in_progress' && (
                <form onSubmit={handleAddMilestone} className="add-ms-form">
                  <h4>Add Milestone</h4>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Title</label>
                      <input placeholder="e.g. UI Design" value={msForm.title}
                        onChange={e => setMsForm(p => ({ ...p, title: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label>Amount (₹)</label>
                      <input type="number" placeholder="500" value={msForm.amount}
                        onChange={e => setMsForm(p => ({ ...p, amount: e.target.value }))} required />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={msLoading}>
                    {msLoading ? 'Adding...' : 'Add Milestone'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Chat */}
          {project.assignedTo && (isClient || isAssignedStudent) && (
            <ChatBox
              projectId={project._id}
              otherUser={isClient ? project.assignedTo?.name : project.postedBy?.name}
            />
          )}
        </div>

        <div className="project-sidebar">
          {user?.role === 'student' && project.status === 'open' && !myBid && (
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Place Your Bid</h3>
              <form onSubmit={handlePlaceBid} className="bid-form">
                <div className="form-group">
                  <label>Your Bid (₹)</label>
                  <input type="number" placeholder={project.budget} value={bidForm.bidAmount}
                    onChange={e => setBidForm(p => ({ ...p, bidAmount: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Delivery Time (days)</label>
                  <input type="number" placeholder={project.deadline} value={bidForm.deliveryTime}
                    onChange={e => setBidForm(p => ({ ...p, deliveryTime: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Proposal</label>
                  <textarea rows={4} placeholder="Explain why you're the best fit..."
                    value={bidForm.proposal}
                    onChange={e => setBidForm(p => ({ ...p, proposal: e.target.value }))} required />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={bidLoading}>
                  {bidLoading ? 'Submitting...' : 'Submit Bid'}
                </button>
              </form>
            </div>
          )}

          {myBid && (
            <div className="card">
              <h3 style={{ marginBottom: 8 }}>Your Bid</h3>
              <div className={`badge badge-${myBid.status}`} style={{ marginBottom: 12 }}>{myBid.status}</div>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>₹{myBid.bidAmount} · {myBid.deliveryTime} days</p>
            </div>
          )}

          {isClient && (
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Bids Received ({bids.length})</h3>
              {bids.length === 0 ? (
                <p className="text-muted">No bids yet. Share your project!</p>
              ) : (
                <div className="bids-list">
                  {bids.map(bid => (
                    <div key={bid._id} className="bid-item">
                      <div className="bid-header">
                        <div className="bid-student">
                          <div className="bid-avatar">{bid.studentId?.name?.[0]}</div>
                          <div>
                            <div className="bid-name">{bid.studentId?.name}</div>
                            <div className="bid-college">{bid.studentId?.college}</div>
                          </div>
                        </div>
                        <span className={`badge badge-${bid.status}`}>{bid.status}</span>
                      </div>
                      <div className="bid-details">
                        <span className="bid-amount">₹{bid.bidAmount.toLocaleString()}</span>
                        <span className="text-muted">· {bid.deliveryTime} days</span>
                      </div>
                      <p className="bid-proposal">{bid.proposal}</p>
                      {bid.studentId?.skills?.length > 0 && (
                        <div className="bid-skills">
                          {bid.studentId.skills.slice(0, 3).map(s => <span key={s} className="tag">{s}</span>)}
                        </div>
                      )}
                      {project.status === 'open' && bid.status === 'pending' && (
                        <button className="btn btn-success btn-sm mt-8"
                          onClick={() => handleAcceptBid(bid._id)}>
                          Accept This Bid ✓
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!user && (
            <div className="card text-center">
              <p style={{ marginBottom: 12, color: 'var(--text2)' }}>Sign in to place a bid</p>
              <a href="/login" className="btn btn-primary btn-full">Login to Bid</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
