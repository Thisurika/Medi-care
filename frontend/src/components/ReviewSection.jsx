import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Star, Send, User } from 'lucide-react';

function InteractiveStars({ rating, setRating, readonly = false, size = 18 }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="review-stars-interactive" id="review-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`review-star ${star <= (readonly ? rating : hover || rating) ? 'filled' : ''}`}
          onClick={() => !readonly && setRating(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
          fill={star <= (readonly ? rating : hover || rating) ? 'var(--amber)' : 'transparent'}
          color={star <= (readonly ? rating : hover || rating) ? 'var(--amber)' : 'var(--text-muted)'}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const patientName = review.patient?.name || 'Anonymous';
  const initial = patientName.charAt(0).toUpperCase();
  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="review-card" id={`review-${review._id}`}>
      <div className="review-card-header">
        <div className="review-author">
          <div className="review-avatar">{initial}</div>
          <div>
            <div className="review-author-name">{patientName}</div>
            <div className="review-date">{date}</div>
          </div>
        </div>
        <InteractiveStars rating={review.rating} readonly size={14} />
      </div>
      {review.comment && (
        <p className="review-comment">{review.comment}</p>
      )}
    </div>
  );
}

export default function ReviewSection({ doctorId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (doctorId) fetchReviews();
  }, [doctorId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/feedback/doctor/${doctorId}`);
      setReviews(data.feedbacks || []);
    } catch {
      setError('Could not load reviews.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      await api.post('/feedback', {
        doctor_id: doctorId,
        rating,
        comment,
      });
      setSuccessMsg('Review submitted successfully!');
      setShowForm(false);
      setRating(5);
      setComment('');
      fetchReviews();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  // Compute stats
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length
      ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100)
      : 0,
  }));

  return (
    <div className="review-section" id="review-section">
      <div className="review-section-header">
        <h3 className="review-section-title">Reviews & Ratings</h3>
        {user?.role === 'patient' && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowForm((p) => !p)}
            id="write-review-btn"
          >
            <Star size={14} />
            {showForm ? 'Cancel' : 'Write Review'}
          </button>
        )}
      </div>

      {/* Rating summary */}
      {reviews.length > 0 && (
        <div className="review-summary">
          <div className="review-summary-score">
            <div className="review-big-number">{avgRating}</div>
            <InteractiveStars rating={Math.round(parseFloat(avgRating))} readonly size={16} />
            <div className="review-total">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
          </div>
          <div className="review-summary-bars">
            {ratingDist.map(({ star, count, pct }) => (
              <div key={star} className="review-bar-row">
                <span className="review-bar-label">{star} ★</span>
                <div className="review-bar-track">
                  <div className="review-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="review-bar-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error / success */}
      {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}
      {successMsg && <div className="success-msg" style={{ marginBottom: 12 }}>{successMsg}</div>}

      {/* Review form */}
      {showForm && user?.role === 'patient' && (
        <form className="review-form card" onSubmit={handleSubmit} id="review-form">
          <div style={{ marginBottom: 12 }}>
            <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>Your Rating</label>
            <InteractiveStars rating={rating} setRating={setRating} size={24} />
          </div>
          <div className="form-group">
            <label className="form-label">Comment (optional)</label>
            <textarea
              className="form-control"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience…"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            <Send size={14} />
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Review list */}
      <div className="review-list">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : reviews.length === 0 ? (
          <div className="review-empty">
            <User size={24} style={{ opacity: 0.3 }} />
            <span>No reviews yet. Be the first to leave one!</span>
          </div>
        ) : (
          reviews.map((r) => <ReviewCard key={r._id} review={r} />)
        )}
      </div>
    </div>
  );
}
