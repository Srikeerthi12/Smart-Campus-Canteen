import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiArrowRight, FiClock, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';
import { canteenService } from '../services/canteenService';
import { getCanteenStatus } from '../utils/canteenUtils';
import { formatTime } from '../utils/formatters';
import Footer from '../components/common/Footer';

const STEPS = [
  { icon: '🔍', title: 'Browse Canteens', desc: 'See all campus canteens with live open/closed status at a glance.' },
  { icon: '📋', title: 'Check the Menu', desc: 'View real-time menu availability and prices before you go.' },
  { icon: '🛒', title: 'Order Online', desc: 'Add to cart and place your order. Pick it up when ready!' },
];

const BENEFITS = [
  { icon: '⚡', title: 'Save Time', desc: 'No more wasted trips to closed canteens.' },
  { icon: '💰', title: 'Know Prices', desc: 'Check item prices before visiting.' },
  { icon: '🟢', title: 'Live Status', desc: 'Real-time open/closed and item availability.' },
  { icon: '📱', title: 'Track Orders', desc: 'Follow your order from kitchen to counter.' },
];

const Landing = () => {
  const [search, setSearch] = useState('');
  const [canteens, setCanteens] = useState([]);

  useEffect(() => {
    canteenService.getAll().then(setCanteens).catch(() => {});
  }, []);

  const filtered = canteens.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: '#FFF8F0', minHeight: '100vh' }}>
      {/* ── NAVBAR ── */}
      <nav style={{
        background: 'rgba(255,248,240,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,122,0,0.1)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, #FF7A00, #FFB703)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(255,122,0,0.35)',
            }}>
              <MdRestaurant color="white" size={22} />
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#2D3436' }}>
              Campus<span className="gradient-text">Eats</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/login" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>Login</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE5C2 50%, #FFF3E0 100%)',
        padding: '100px 0 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative blobs */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,122,0,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,183,3,0.1)', pointerEvents: 'none' }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,122,0,0.1)', borderRadius: '20px',
            padding: '6px 16px', marginBottom: '24px',
            fontSize: '0.85rem', fontWeight: 600, color: '#FF7A00',
            border: '1px solid rgba(255,122,0,0.2)',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'pulse-orange 2s infinite' }} />
            Live campus canteen tracker
          </div>

          <h1 style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 900,
            fontSize: 'clamp(2.2rem, 6vw, 4rem)',
            color: '#2D3436', lineHeight: 1.15, marginBottom: '20px',
          }}>
            Know What's Available<br />
            <span className="gradient-text">Before You Visit</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: '#636e72', maxWidth: '580px',
            margin: '0 auto 40px', lineHeight: 1.7,
          }}>
            Check live menu availability, canteen timings, and order food online — all from one place.
          </p>

          {/* Search bar */}
          <div style={{
            maxWidth: '560px', margin: '0 auto 40px',
            position: 'relative',
          }}>
            <FiSearch size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#b2bec3', pointerEvents: 'none' }} />
            <input
              id="hero-search"
              type="text"
              placeholder="What's available right now?"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '18px 20px 18px 52px',
                borderRadius: '18px', border: '2px solid rgba(255,122,0,0.2)',
                fontSize: '1rem', fontFamily: 'Inter, sans-serif',
                background: 'white', color: '#2D3436', outline: 'none',
                boxShadow: '0 8px 32px rgba(255,122,0,0.12)',
                transition: 'all 0.3s',
              }}
              onFocus={e => e.target.style.borderColor = '#FF7A00'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,122,0,0.2)'}
            />
            {search && (
              <div style={{
                position: 'absolute', left: 0, right: 0, top: '100%',
                background: 'white', borderRadius: '16px', marginTop: '8px',
                boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                border: '1px solid rgba(255,122,0,0.1)',
                overflow: 'hidden', zIndex: 10,
              }}>
                {filtered.length ? filtered.slice(0, 5).map(c => {
                  const { label, className } = getCanteenStatus(c.openTime, c.closeTime);
                  return (
                    <Link key={c._id} to={`/canteens/${c._id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderBottom: '1px solid rgba(0,0,0,0.04)',
                        transition: 'background 0.2s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,122,0,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2D3436' }}>{c.name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#636e72' }}>{c.location}</div>
                        </div>
                        <span className={`badge ${className}`}>{label}</span>
                      </div>
                    </Link>
                  );
                }) : (
                  <div style={{ padding: '16px 18px', color: '#636e72', fontSize: '0.9rem' }}>No canteens found</div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              Get Started Free <FiArrowRight />
            </Link>
            <Link to="/login" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              Already a student? Login
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', marginTop: '60px', flexWrap: 'wrap' }}>
            {[['🏪', `${canteens.length || '10'}+`, 'Campus Canteens'], ['🍽️', '200+', 'Menu Items'], ['⚡', 'Live', 'Real-time Status']].map(([emoji, num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{emoji}</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#FF7A00' }}>{num}</div>
                <div style={{ fontSize: '0.8rem', color: '#636e72', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED CANTEENS ── */}
      {canteens.length > 0 && (
        <section style={{ padding: '80px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 className="section-title">Featured Canteens</h2>
              <p className="section-subtitle">Currently available on campus</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {canteens.slice(0, 6).map((canteen, i) => {
                const { isOpen, label, className } = getCanteenStatus(canteen.openTime, canteen.closeTime);
                return (
                  <Link key={canteen._id} to={`/canteens/${canteen._id}`} style={{ textDecoration: 'none' }}>
                    <div className="clay-card animate-fade-in-up" style={{ padding: '24px', animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        {canteen.imageUrl ? (
                          <img
                            src={canteen.imageUrl}
                            alt={canteen.name}
                            style={{
                              width: '52px', height: '52px',
                              objectFit: 'cover',
                              borderRadius: '14px',
                              boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '52px', height: '52px',
                            background: 'linear-gradient(135deg, rgba(255,122,0,0.15), rgba(255,183,3,0.15))',
                            borderRadius: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem',
                          }}>🍽️</div>
                        )}
                        <span className={`badge ${className}`}>{label}</span>
                      </div>
                      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#2D3436', marginBottom: '12px' }}>{canteen.name}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#636e72' }}>
                          <FiMapPin size={12} color="#FF7A00" />{canteen.location}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#636e72' }}>
                          <FiClock size={12} color="#FF7A00" />{formatTime(canteen.openTime)} – {formatTime(canteen.closeTime)}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link to="/canteens" className="btn-secondary">View All Canteens <FiArrowRight /></Link>
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #FFE5C2, #FFF8F0)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Three simple steps to your next campus meal</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
            {STEPS.map((step, i) => (
              <div key={i} className="clay-card" style={{ padding: '32px 24px', textAlign: 'center' }}>
                <div style={{
                  width: '72px', height: '72px',
                  background: 'linear-gradient(135deg, rgba(255,122,0,0.12), rgba(255,183,3,0.12))',
                  borderRadius: '22px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', margin: '0 auto 20px',
                  animation: 'float 3s ease-in-out infinite',
                  animationDelay: `${i * 0.5}s`,
                }}>
                  {step.icon}
                </div>
                <div style={{
                  display: 'inline-flex', width: '28px', height: '28px',
                  background: 'linear-gradient(135deg, #FF7A00, #FFB703)',
                  borderRadius: '50%', color: 'white', fontWeight: 800,
                  fontSize: '0.9rem', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '12px',
                }}>{i + 1}</div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#2D3436', marginBottom: '10px' }}>
                  {step.title}
                </h3>
                <p style={{ color: '#636e72', fontSize: '0.9rem', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="section-title">Why CampusEats?</h2>
            <p className="section-subtitle">Built for students, by students</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {BENEFITS.map((b, i) => (
              <div key={i} className="clay-card" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{b.icon}</div>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#2D3436', marginBottom: '8px' }}>{b.title}</h4>
                <p style={{ color: '#636e72', fontSize: '0.85rem', lineHeight: 1.6 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, #FF7A00, #FFB703)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'white', marginBottom: '16px' }}>
            Ready to Order Smarter?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px' }}>
            Join thousands of students who never guess about canteen availability again.
          </p>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'white', color: '#FF7A00',
            fontWeight: 700, fontSize: '1rem',
            padding: '16px 32px', borderRadius: '16px',
            textDecoration: 'none',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            transition: 'all 0.3s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Create Free Account <FiArrowRight />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
