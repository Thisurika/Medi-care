import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Star } from 'lucide-react';

function StarRating({ rating }) {
  return (
    <span className="feedback-stars">
      <Star size={13} fill="currentColor" />
      {rating}
    </span>
  );
}

function FeedbackCard({ fb, canDelete, onDelete }) {
  const doctorName = fb.doctor?.user?.name || '—';
  const patientName = fb.patient?.name || '—';

  return (
    <div className="feedback-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="feedback-doctor-name">{doctorName}</div>
          <div className="feedback-from">From {patientName}</div>
        </div>
        <StarRating rating={fb.rating} />
      </div>
      <div className="feedback-comment">{fb.comment || <span style={{ fontStyle:'italic', opacity:0.5 }}>No comment provided.</span>}</div>
      <div className="feedback-actions">
        {canDelete && (
          <span className="action-link delete" onClick={() => onDelete(fb._id)}>Delete</span>
        )}
      </div>
    </div>
  );
}

function NewFeedbackForm({ doctors, onSuccess, onCancel }) {
  const [form, setForm] = useState({ doctor_id: '', rating: 5, comment: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/feedback', { doctor_id: form.doctor_id, rating: Number(form.rating), comment: form.comment });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 500, marginBottom: 24 }}>
      <div className="section-title" style={{ marginBottom: 16 }}>Leave a Review</div>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Doctor</label>
          <select name="doctor_id" value={form.doctor_id} onChange={handleChange} className="form-control" required>
            <option value="">Select doctor</option>
            {doctors.map(d => <option key={d._id} value={d._id}>{d.user?.name} ({d.specialization})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Rating (1–5)</label>
          <select name="rating" value={form.rating} onChange={handleChange} className="form-control">
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{'⭐'.repeat(n)} ({n})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Comment</label>
          <textarea name="comment" value={form.comment} onChange={handleChange} className="form-control" placeholder="Share your experience…" />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Submitting…' : 'Submit Review'}</button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default function Feedback() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/feedback');
      setFeedbacks(data.feedbacks || data.data || []);
    } catch { setError('Could not load feedback.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchFeedback();
    if (user?.role === 'patient') {
      api.get('/doctors').then(r => setDoctors(r.data.doctors || r.data.data || [])).catch(() => {});
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try { await api.delete(`/feedback/${id}`); fetchFeedback(); }
    catch { alert('Delete failed.'); }
  };

  return (
    <Layout>
      <div className="page-header-row" style={{ marginBottom: 28 }}>
        <div>
          <div className="page-breadcrumb">Feedback</div>
          <h1 className="page-title">Doctor ratings</h1>
        </div>
        {user?.role === 'patient' && (
          <button className="btn btn-primary" onClick={() => setShowForm(p => !p)}>
            <Star size={14} /> {showForm ? 'Cancel' : 'Add Review'}
          </button>
        )}
      </div>

      {showForm && user?.role === 'patient' && (
        <NewFeedbackForm
          doctors={doctors}
          onSuccess={() => { setShowForm(false); fetchFeedback(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : feedbacks.length === 0 ? (
        <div className="empty-state card"><div className="empty-icon">⭐</div>No feedback found</div>
      ) : feedbacks.map(fb => (
        <FeedbackCard
          key={fb._id}
          fb={fb}
          canDelete={user?.role === 'admin'}
          onDelete={handleDelete}
        />
      ))}
    </Layout>
  );
}
