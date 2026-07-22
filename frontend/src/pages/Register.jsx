import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', phone: '', gender: '' });
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Allow digits only
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
    // Validate SL phone: exactly 10 digits starting with 0
    if (form.phone && !/^0[0-9]{9}$/.test(form.phone)) {
      setPhoneError('Enter a valid SL number (e.g. 0771234567)');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card" style={{ maxWidth: 460 }}>
        <div className="auth-logo">
          <div style={{ width:38,height:38,borderRadius:9,background:'linear-gradient(135deg,#2563eb,#06b6d4)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,color:'white' }}>M+</div>
          <div>
            <div style={{ fontWeight:700,fontSize:16,color:'var(--text-primary)' }}>MediCare Plus</div>
            <div style={{ fontSize:11,color:'var(--text-muted)' }}>Quality healthcare, simplified.</div>
          </div>
        </div>

        <div className="auth-title">Create account</div>
        <div className="auth-sub">Start your healthcare journey today</div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="form-control" placeholder="Dr. Jane Smith" required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="form-control" placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone (SL)</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={`form-control${phoneError ? ' input-error' : ''}`}
                placeholder="0771234567"
                maxLength={10}
              />
              {phoneError && <span style={{ color: '#f87171', fontSize: 11, marginTop: 3, display: 'block' }}>{phoneError}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} className="form-control" placeholder="••••••••" required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="form-control">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="form-control">
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width:'100%', padding:'11px', fontSize:14 }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
