import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      admin:   { email: 'admin@medicareplus.test',  password: 'password123' },
      doctor:  { email: 'ozella@medicareplus.test', password: 'password123' },
      patient: { email: 'ollie@medicareplus.test',  password: 'password123' },
    };
    setForm(creds[role]);
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
          Welcome back to <span className="highlight">MediCare Plus</span>
        </h1>

        <p className="auth-hero-subtitle">
          Access your dashboard, manage appointments, and stay connected
          with your care team — all in one secure portal.
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
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} className="form-control"
                placeholder="you@example.com" required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password" value={form.password}
                  onChange={handleChange} className="form-control"
                  style={{ paddingRight: 42 }}
                  placeholder="••••••••" required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', color: '#64748b', cursor: 'pointer',
                    display: 'flex'
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Footer row: link + submit */}
            <div className="auth-footer">
              <span>Don't have an account? <Link to="/register">Create one</Link></span>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Quick demo fill */}
          <div className="auth-demo-section">
            <div className="auth-demo-label">Quick demo login</div>
            <div className="auth-demo-btns">
              {['admin', 'doctor', 'patient'].map(r => (
                <button key={r} onClick={() => fillDemo(r)} type="button">
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
