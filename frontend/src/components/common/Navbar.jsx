import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX,
  FiHome, FiPackage
} from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <FiHome size={16} /> },
    { to: '/canteens', label: 'Canteens', icon: <MdRestaurant size={16} /> },
    { to: '/orders', label: 'My Orders', icon: <FiPackage size={16} /> },
  ];

  const links = studentLinks;

  return (
    <nav style={{
      background: 'rgba(255, 248, 240, 0.92)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 122, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'linear-gradient(135deg, #FF7A00, #FFB703)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(255, 122, 0, 0.35)',
          }}>
            <MdRestaurant color="white" size={22} />
          </div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#2D3436' }}>
            Campus<span className="gradient-text">Eats</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: isActive(link.to) ? 600 : 500,
                color: isActive(link.to) ? '#FF7A00' : '#636e72',
                background: isActive(link.to) ? 'rgba(255,122,0,0.1)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              {link.icon}{link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Cart */}
          <Link to="/cart" style={{ position: 'relative', textDecoration: 'none' }}>
              <button className="btn-icon" id="cart-icon-btn">
                <FiShoppingCart size={20} />
                {getTotalItems() > 0 && (
                  <span className="cart-bubble">{getTotalItems()}</span>
                )}
              </button>
            </Link>

          {/* Profile */}
          <Link to="/profile">
            <div style={{
              width: '38px', height: '38px',
              background: 'linear-gradient(135deg, rgba(255,122,0,0.15), rgba(255,183,3,0.15))',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid rgba(255,122,0,0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              <FiUser size={16} color="#FF7A00" />
            </div>
          </Link>

          {/* Logout */}
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="btn-icon"
            title="Logout"
          >
            <FiLogOut size={18} />
          </button>

          {/* Mobile hamburger */}
          <button
            className="btn-icon md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            id="mobile-menu-btn"
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'white',
          borderTop: '1px solid rgba(255,122,0,0.08)',
          padding: '12px 24px 20px',
          animation: 'fadeIn 0.2s ease',
        }}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                color: isActive(link.to) ? '#FF7A00' : '#2D3436',
                background: isActive(link.to) ? 'rgba(255,122,0,0.08)' : 'transparent',
                marginBottom: '4px',
              }}
            >
              {link.icon}{link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
