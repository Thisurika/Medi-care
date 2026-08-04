import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, Shield, Calendar, Activity, Phone, Mail, MapPin, Star, Clock, ArrowRight } from 'lucide-react';
import api from '../api/axios';

const INITIAL_SERVICES = [
  {
    id: 1,
    category: 'Radiology',
    categoryColor: '#8b5cf6',
    title: 'Paste-Up Worker Care',
    description: 'Cum ad qui qui voluptat et saepe consequuntur ea. Ex accusamus ipsum...'
  },
  {
    id: 2,
    category: 'Dermatology',
    categoryColor: '#06b6d4',
    title: 'Tool Set-Up Operator Care',
    description: 'Delectus sit amet aliquam fugiat qui optio. Rerum modi et enim consequatur. A quia id...'
  },
  {
    id: 3,
    category: 'Orthopedics',
    categoryColor: '#f59e0b',
    title: 'Foreign Language Teacher Care',
    description: 'Aspernatur quam et maiores molestiae consectetuer quas. Rerum non odit illo non...'
  },
  {
    id: 4,
    category: 'Pediatrics',
    categoryColor: '#10b981',
    title: 'Grinder OR Polisher Care',
    description: 'Aut quaerat est sequi sit. Qui dolores labore consequuntur id recusandae et ut natus...'
  },
  {
    id: 5,
    category: 'Orthopedics',
    categoryColor: '#f59e0b',
    title: 'Operations Research Analyst Care',
    description: 'Vel esse non consequatur consequuntur unde minima aperiam. Soluta quod ut hic delectu...'
  },
  {
    id: 6,
    category: 'Pediatrics',
    categoryColor: '#10b981',
    title: 'Metal Pourer and Caster Care',
    description: 'Rerum illum ex et voluptas officiis. Ad consequatur culpa quis. Corporis aut vel...'
  }
];

const AVATAR_COLORS = ['#2563eb','#06b6d4','#8b5cf6','#10b981','#f59e0b','#ef4444'];
const getColor = n => AVATAR_COLORS[(n?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const getInitials = n => (n||'').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [featuredDoctors, setFeaturedDoctors] = useState([]);

  useEffect(() => {
    // Attempt to load dynamic services from API if available
    const fetchServices = async () => {
      try {
        const { data } = await api.get('/services');
        const list = data.services || data.data || [];
        if (list.length > 0) {
          const categoryColors = {
            Radiology: '#8b5cf6',
            Dermatology: '#06b6d4',
            Orthopedics: '#f59e0b',
            Pediatrics: '#10b981',
            Neurology: '#3b82f6',
            Cardiology: '#ef4444'
          };
          const formatted = list.slice(0, 6).map((s, idx) => ({
            id: s._id || idx,
            category: s.category || 'General Care',
            categoryColor: categoryColors[s.category] || '#2563eb',
            title: s.name || s.title || INITIAL_SERVICES[idx % 6].title,
            description: s.description || INITIAL_SERVICES[idx % 6].description
          }));
          if (formatted.length >= 6) {
            setServices(formatted);
          }
        }
      } catch {
        // Silent fallback to initial screenshot services
      }
    };
    fetchServices();
  }, []);

  // Fetch featured doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await api.get('/doctors');
        const docs = data.doctors || data.data || [];
        // Already sorted by rating_avg desc from backend
        setFeaturedDoctors(docs.slice(0, 6));
      } catch {
        // Silent fail
      }
    };
    fetchDoctors();
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookDoctor = (doctorId) => {
    if (user) {
      navigate(`/appointments/new?doctor=${doctorId}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className={`landing-page ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Background ambient radial glows */}
      <div className="ambient-glow glow-top-left"></div>
      <div className="ambient-glow glow-top-right"></div>
      <div className="ambient-glow glow-bottom-center"></div>

      {/* Top Header / Navigation */}
      <header className="landing-navbar">
        <div className="landing-nav-container">
          {/* Logo Section */}
          <Link to="/" className="landing-brand">
            <div className="brand-logo-badge">
              <span className="brand-logo-text">M+</span>
            </div>
            <div className="brand-title-group">
              <div className="brand-name">MediCare Plus</div>
              <div className="brand-tagline">Quality healthcare, simplified.</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="landing-nav-links">
            <a href="#doctors" onClick={(e) => { e.preventDefault(); scrollToSection('featured-doctors-section'); }}>Doctors</a>
            <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services-section'); }}>Services</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about-section'); }}>About</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact-section'); }}>Contact</a>
          </nav>

          {/* Action Buttons */}
          <div className="landing-nav-actions">
            <button 
              className="theme-toggle-btn" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <button className="btn-join-patient" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-signin-link">
                  Sign in
                </Link>
                <Link to="/register" className="btn-join-patient">
                  Join as Patient
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Main Section */}
      <section className="landing-hero-section">
        <div className="hero-content-wrapper">
          {/* Left Column: Hero Content & CTAs */}
          <div className="hero-left-column">
            <div className="next-gen-pill">
              <span className="pill-dot"></span>
              <span>Next-gen healthcare platform</span>
            </div>

            <h1 className="hero-main-title">
              Meet <span className="highlight-blue-gradient">MediCare Plus</span> — your unified space for doctors, appointments, and secure reports.
            </h1>

            <p className="hero-subtitle">
              Discover specialists, book visits with real-time availability, chat securely, and keep all medical records accessible from anywhere.
            </p>

            <div className="hero-cta-group">
              <button className="btn-get-started" onClick={() => navigate(user ? '/dashboard' : '/register')}>
                Get Started
              </button>
              <button className="btn-browse-doctors" onClick={() => scrollToSection('featured-doctors-section')}>
                Browse Doctors
              </button>
            </div>

            {/* 24/7 Always-on patient portal stat badge */}
            <div className="portal-stat-badge">
              <div className="stat-circle-badge">
                <span>24/7</span>
              </div>
              <div className="stat-text-content">
                <div className="stat-headline">Always-on patient portal</div>
                <div className="stat-subtext">Access labs, reports, and chat history securely.</div>
              </div>
            </div>
          </div>

          {/* Right Column: 6 Services Cards Grid Container */}
          <div className="hero-right-column">
            <div className="services-glass-container" id="services-section">
              <div className="services-card-grid">
                {services.map((item) => (
                  <div key={item.id} className="service-hero-card">
                    <div className="card-category" style={{ color: item.categoryColor }}>
                      {item.category}
                    </div>
                    <h3 className="card-item-title">{item.title}</h3>
                    <p className="card-item-desc">{item.description}</p>
                  </div>
                ))}
              </div>

              <div className="services-container-footer">
                <span className="footer-prompt">Looking for something else?</span>
                <Link to={user ? "/services" : "/login"} className="btn-view-all-services">
                  View all services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      {featuredDoctors.length > 0 && (
        <section className="featured-doctors-section" id="featured-doctors-section">
          <div className="featured-doctors-container">
            <div className="featured-doctors-header">
              <div>
                <span className="featured-doctors-label">Top-rated clinicians</span>
                <h2 className="featured-doctors-title">Featured doctors</h2>
              </div>
              <a
                href="#"
                className="featured-see-all"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(user ? '/doctors' : '/login');
                }}
              >
                See all <ArrowRight size={16} />
              </a>
            </div>

            <div className="featured-doctors-grid">
              {featuredDoctors.map((doc) => {
                const name = doc.user?.name || '—';
                const spec = doc.specialization || 'General';
                const aboutText = doc.about || 'Experienced medical professional dedicated to providing quality patient care.';
                const rating = doc.rating_avg?.toFixed(1) || '5.0';
                const exp = doc.experience_years || 0;

                return (
                  <div key={doc._id} className="featured-doctor-card">
                    <div className="featured-doctor-card-top">
                      <div className="featured-doctor-avatar" style={{ background: getColor(name) }}>
                        {getInitials(name)}
                      </div>
                      <div className="featured-doctor-info">
                        <div className="featured-doctor-name">{name}</div>
                        <div className="featured-doctor-spec">{spec}</div>
                      </div>
                    </div>

                    <p className="featured-doctor-about">{aboutText}</p>

                    <div className="featured-doctor-bottom">
                      <div className="featured-doctor-stats">
                        <span className="featured-doctor-rating">
                          <Star size={13} fill="#f59e0b" color="#f59e0b" /> Rating {rating}
                        </span>
                        <span className="featured-doctor-exp">
                          {exp} yrs exp
                        </span>
                      </div>
                      <button
                        className="featured-doctor-book-btn"
                        onClick={() => handleBookDoctor(doc._id)}
                      >
                        Book with {name.split(' ')[0]} {name.split(' ').length > 1 ? name.split(' ').slice(1).join(' ') : ''}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Feature Highlights Section */}
      <section className="landing-features-section" id="about-section">
        <div className="features-container">
          <div className="section-header center">
            <h2 className="section-title">Why Healthcare Professionals & Patients Choose MediCare Plus</h2>
            <p className="section-sub">Engineered to streamline modern clinical workflows and deliver exceptional patient outcomes.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper blue">
                <Calendar size={24} />
              </div>
              <h3>Real-Time Scheduling</h3>
              <p>Instant booking with automated slot conflict prevention, reminder notifications, and flexible rescheduling.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper cyan">
                <Shield size={24} />
              </div>
              <h3>Encrypted Medical Records</h3>
              <p>HIPAA & GDPR aligned document vault ensuring your diagnostic reports and lab results stay completely private.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper purple">
                <Activity size={24} />
              </div>
              <h3>Doctor-Patient Portal</h3>
              <p>Direct encrypted messaging, follow-ups, and live status tracking for continuous medical care.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="landing-footer" id="contact-section">
        <div className="footer-container">
          <div className="footer-brand-col">
            <div className="brand-logo-badge">
              <span className="brand-logo-text">M+</span>
            </div>
            <span className="footer-brand-title">MediCare Plus</span>
            <p className="footer-desc">Your trusted companion for modern, accessible, and secure healthcare management.</p>
          </div>

          <div className="footer-links-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/login">Patient Sign In</Link></li>
              <li><Link to="/register">Register Account</Link></li>
              <li><a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services-section'); }}>Clinical Services</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Contact Support</h4>
            <ul>
              <li><span className="footer-contact-item"><Mail size={14} /> support@medicareplus.com</span></li>
              <li><span className="footer-contact-item"><Phone size={14} /> +1 (800) 555-0199</span></li>
              <li><span className="footer-contact-item"><MapPin size={14} /> 100 Health Plaza, Medical Center</span></li>
            </ul>
          </div>
        </div>
        <div className="footer-copyright">
          © {new Date().getFullYear()} MediCare Plus. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

