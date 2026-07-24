import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'patient', phone: '', gender: '', address: ''
  });
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      setForm(p => ({ ...p, phone: digits }));
      if (digits.length > 0 && (!/^0[0-9]{9}$/.test(digits))) {
        setPhoneError('Enter a valid SL number (e.g. 0771234567)');
      } else {
        setPhoneError('');
      }
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.phone && !/^0[0-9]{9}$/.test(form.phone)) {
      setPhoneError('Enter a valid SL number (e.g. 0771234567)');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* ── Left hero ── */}
      <div className="auth-hero-side">
        <div className="auth-hero-pill">
          <span className="auth-hero-pill-dot" />
          Healthcare made human
        </div>

        <h1 className="auth-hero-title">
          Welcome to <span className="highlight">MediCare Plus</span>
        </h1>

        <p className="auth-hero-subtitle">
          Book appointments, chat with your care team, and access medical
          reports securely in one beautiful experience.
        </p>

        <div className="auth-hero-badge">
          <div className="auth-hero-badge-icon">M+</div>
          <div className="auth-hero-badge-text">
            <h4>Blue/Teal dual-mode UI</h4>
            <p>Glassmorphic cards with soft gradients</p>
          </div>
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="auth-form-side">
        <div className="auth-card">
          {/* Logo + label */}
          <div className="auth-logo">
            <div className="auth-logo-icon">M+</div>
            <div>
              <div className="auth-logo-label">Secure Access</div>
            </div>
          </div>
          <div className="auth-title">Sign in to your portal</div>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Row: Name + Phone */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input
                  type="text" name="name" value={form.name}
                  onChange={handleChange} className="form-control"
                  placeholder="" required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel" name="phone" value={form.phone}
                  onChange={handleChange}
                  className={`form-control${phoneError ? ' input-error' : ''}`}
                  placeholder="" maxLength={10}
                />
                {phoneError && (
                  <span style={{ color: '#f87171', fontSize: 11, marginTop: 3, display: 'block' }}>
                    {phoneError}
                  </span>
                )}
              </div>
            </div>

            {/* Row: Email + Gender */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} className="form-control"
                  placeholder="" required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender" value={form.gender}
                  onChange={handleChange} className="form-control"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text" name="address" value={form.address}
                onChange={handleChange} className="form-control"
                placeholder=""
              />
            </div>

            {/* Row: Password + Confirm */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password" name="password" value={form.password}
                  onChange={handleChange} className="form-control"
                  placeholder="" required minLength={6}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm password</label>
                <input
                  type="password" name="confirmPassword" value={form.confirmPassword}
                  onChange={handleChange} className="form-control"
                  placeholder="" required minLength={6}
                />
              </div>
            </div>

            {/* Footer row: link + submit */}
            <div className="auth-footer">
              <span>Already registered? <Link to="/login">Sign in</Link></span>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Creating…' : 'Create patient account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
