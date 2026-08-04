import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'patient', phone: '', gender: '', address: '',
    // Doctor-specific fields
    specialization: '', qualifications: '', experience_years: 1,
    consultation_fee: 100, availability_days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    about: ''
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

  const toggleDay = (day) => {
    setForm(p => {
      const days = p.availability_days.includes(day)
        ? p.availability_days.filter(d => d !== day)
        : [...p.availability_days, day];
      return { ...p, availability_days: days };
    });
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
      // Only include doctor fields when role is doctor
      if (payload.role !== 'doctor') {
        delete payload.specialization;
        delete payload.qualifications;
        delete payload.experience_years;
        delete payload.consultation_fee;
        delete payload.availability_days;
        delete payload.about;
      }
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
          <div className="auth-title">
            {form.role === 'doctor' ? 'Create doctor profile' : 'Sign in to your portal'}
          </div>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">I am registering as a</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={form.role === 'patient'}
                    onChange={handleChange}
                  />
                  Patient
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="role"
                    value="doctor"
                    checked={form.role === 'doctor'}
                    onChange={handleChange}
                  />
                  Doctor
                </label>
              </div>
            </div>

            {/* Row: Name + Email */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text" name="name" value={form.name}
                  onChange={handleChange} className="form-control"
                  placeholder="" required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} className="form-control"
                  placeholder="" required
                />
              </div>
            </div>

            {/* Row: Phone + Gender */}
            <div className="form-row">
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

            {/* Row: Address + Password */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text" name="address" value={form.address}
                  onChange={handleChange} className="form-control"
                  placeholder=""
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password" name="password" value={form.password}
                  onChange={handleChange} className="form-control"
                  placeholder="" required minLength={6}
                />
              </div>
            </div>

            {/* Confirm password */}
            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input
                type="password" name="confirmPassword" value={form.confirmPassword}
                onChange={handleChange} className="form-control"
                placeholder="" required minLength={6}
              />
            </div>

            {/* ── Doctor-specific fields ── */}
            {form.role === 'doctor' && (
              <div className="doctor-register-fields">
                <div className="doctor-fields-divider">
                  <span>Doctor Profile Details</span>
                </div>

                {/* Row: Specialization + Qualifications */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <input
                      type="text" name="specialization" value={form.specialization}
                      onChange={handleChange} className="form-control"
                      placeholder="e.g. Dermatology" required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Qualifications</label>
                    <input
                      type="text" name="qualifications" value={form.qualifications}
                      onChange={handleChange} className="form-control"
                      placeholder="e.g. MBBS, MD"
                    />
                  </div>
                </div>

                {/* Row: Experience + Consultation Fee */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Experience (years)</label>
                    <input
                      type="number" name="experience_years" value={form.experience_years}
                      onChange={handleChange} className="form-control"
                      min={0} max={60}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Consultation fee</label>
                    <input
                      type="number" name="consultation_fee" value={form.consultation_fee}
                      onChange={handleChange} className="form-control"
                      min={0}
                    />
                  </div>
                </div>

                {/* Availability Days */}
                <div className="form-group">
                  <label className="form-label">Availability days</label>
                  <div className="availability-day-row">
                    {DAYS.map(day => (
                      <label key={day} className="day-checkbox-label">
                        <input
                          type="checkbox"
                          checked={form.availability_days.includes(day)}
                          onChange={() => toggleDay(day)}
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* About */}
                <div className="form-group">
                  <label className="form-label">About</label>
                  <textarea
                    name="about" value={form.about}
                    onChange={handleChange} className="form-control"
                    placeholder="Brief description about your practice..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Footer row: link + submit */}
            <div className="auth-footer">
              <span>Already registered? <Link to="/login">Sign in</Link></span>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Creating…' : form.role === 'doctor' ? 'Create doctor account' : 'Create patient account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
