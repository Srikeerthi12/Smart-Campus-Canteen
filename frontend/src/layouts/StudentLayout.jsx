import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Toaster } from 'react-hot-toast';
import { MdRestaurant } from 'react-icons/md';
import {
  FiHome, FiList, FiPackage, FiUser, FiShoppingCart,
  FiLogOut, FiMenu, FiX, FiChevronRight
} from 'react-icons/fi';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const cartCount = cart ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <FiHome size={18} /> },
    { to: '/canteens', label: 'Canteens', icon: <FiList size={18} /> },
    { 
      to: '/cart', 
      label: 'Cart', 
      icon: (
        <div style={{ position: 'relative' }}>
          <FiShoppingCart size={18} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: '-8px', right: '-8px',
              background: '#FF7A00', color: 'white',
              fontSize: '0.65rem', fontWeight: 800,
              width: '15px', height: '15px',
              borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            }}>{cartCount}</span>
          )}
        </div>
      )
    },
    { to: '/orders', label: 'My Orders', icon: <FiPackage size={18} /> },
    { to: '/profile', label: 'Profile', icon: <FiUser size={18} /> },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFF8F0' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '240px' : '72px',
        background: 'white',
        borderRight: '1px solid rgba(255,122,0,0.1)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh',
        boxShadow: '2px 0 20px rgba(255,122,0,0.06)',
      }}>
        {/* Logo area */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid rgba(255,122,0,0.08)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '40px', height: '40px', flexShrink: 0,
            background: 'linear-gradient(135deg, #FF7A00, #FFB703)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(255,122,0,0.3)',
          }}>
            <MdRestaurant color="white" size={22} />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#2D3436' }}>
                Campus<span style={{ color: '#FF7A00' }}>Eats</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#636e72', fontWeight: 500 }}>
                Student Portal
              </div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                title={!sidebarOpen ? item.label : ''}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  color: active ? '#FF7A00' : '#636e72',
                  background: active ? 'rgba(255,122,0,0.1)' : 'transparent',
                  fontWeight: active ? 600 : 500,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap', overflow: 'hidden',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,122,0,0.05)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
                {sidebarOpen && active && <FiChevronRight size={14} style={{ marginLeft: 'auto' }} />}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '16px 10px', borderTop: '1px solid rgba(255,122,0,0.08)' }}>
          {sidebarOpen && (
            <div style={{
              padding: '12px', marginBottom: '8px',
              background: 'rgba(255,122,0,0.05)', borderRadius: '12px',
            }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#2D3436', marginBottom: '2px' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#636e72' }}>{user?.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            id="student-logout-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '10px 14px',
              borderRadius: '12px', border: 'none',
              background: 'transparent', cursor: 'pointer',
              color: '#EF4444', fontSize: '0.875rem', fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <FiLogOut size={17} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          background: 'rgba(255,248,240,0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,122,0,0.08)',
          padding: '16px 32px',
          display: 'flex', alignItems: 'center', gap: '16px',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <button
            className="btn-icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            id="sidebar-toggle-btn"
          >
            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#2D3436', margin: 0 }}>
            {navItems.find(n => isActive(n.to))?.label || 'Dashboard'}
          </h1>
          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#636e72' }}>
            Student: <strong>{user?.name}</strong>
          </div>
        </header>

        <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'white',
            color: '#2D3436',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            padding: '12px 18px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.9rem',
            fontWeight: 500,
          },
          success: { iconTheme: { primary: '#22C55E', secondary: 'white' } },
          error: { iconTheme: { primary: '#EF4444', secondary: 'white' } },
        }}
      />
    </div>
  );
};

export default StudentLayout;
