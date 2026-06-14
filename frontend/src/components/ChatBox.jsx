import { useState, useEffect, useRef } from 'react';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ChatBox.css';

// Chat between the client and the selected student for a project.
// Polls for new messages every few seconds — no socket server needed.
export default function ChatBox({ projectId, otherUser }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    fetchMessages(true);
    pollRef.current = setInterval(() => fetchMessages(false), 4000);
    return () => clearInterval(pollRef.current);
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const fetchMessages = async (showLoader) => {
    if (showLoader) setLoading(true);
    try {
      const res = await api.getProjectMessages(projectId);
      setMessages(res.data);
    } catch (err) {
      if (showLoader) toast.error(err.response?.data?.message || 'Failed to load chat');
    }
    if (showLoader) setLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setSending(true);
    try {
      const res = await api.sendMessage({ projectId, text: value });
      setMessages(prev => [...prev, res.data]);
      setText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    }
    setSending(false);
  };

  return (
    <div className="card chat-card mt-20">
      <div className="section-header">
        <h3>Chat {otherUser ? `with ${otherUser}` : ''}</h3>
        <span className="text-muted">Visible to client &amp; selected student only</span>
      </div>

      <div className="chat-messages">
        {loading ? (
          <p className="text-muted chat-empty">Loading conversation...</p>
        ) : messages.length === 0 ? (
          <p className="text-muted chat-empty">No messages yet. Say hello 👋</p>
        ) : (
          messages.map(m => {
            const mine = m.sender?._id === user?._id;
            return (
              <div key={m._id} className={`chat-bubble-row ${mine ? 'mine' : ''}`}>
                <div className="chat-bubble">
                  {!mine && <div className="chat-sender">{m.sender?.name}</div>}
                  <div className="chat-text">{m.text}</div>
                  <div className="chat-time">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-row">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={2000}
        />
        <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
