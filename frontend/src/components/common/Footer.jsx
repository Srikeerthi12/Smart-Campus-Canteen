import { MdRestaurant } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiMail } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer style={{
      background: '#2D3436',
      color: 'rgba(255,255,255,0.7)',
      padding: '48px 0 24px',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px', height: '36px',
                background: 'linear-gradient(135deg, #FF7A00, #FFB703)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MdRestaurant color="white" size={20} />
              </div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'white' }}>
                CampusEats
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.7' }}>
              Your smart campus food companion. Know what's available before you visit.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ color: 'white', fontFamily: 'Outfit, sans-serif', marginBottom: '16px', fontSize: '0.95rem' }}>Quick Links</h4>
            {[['/', 'Home'], ['/canteens', 'Canteens'], ['/login', 'Login'], ['/register', 'Sign Up']].map(([to, label]) => (
              <Link key={to} to={to} style={{
                display: 'block', color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none', fontSize: '0.875rem',
                marginBottom: '10px', transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.target.style.color = '#FF7A00'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'white', fontFamily: 'Outfit, sans-serif', marginBottom: '16px', fontSize: '0.95rem' }}>Contact</h4>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              {[FiMail, FiInstagram, FiTwitter].map((Icon, i) => (
                <button key={i} style={{
                  width: '36px', height: '36px',
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,122,0,0.3)'; e.currentTarget.style.color = '#FF7A00'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '24px',
          display: 'flex', justifyContent: 'center',
          fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)',
        }}>
          © {new Date().getFullYear()} CampusEats. Smart Campus Canteen Management System.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
