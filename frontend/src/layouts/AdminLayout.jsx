import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { MdRestaurant } from 'react-icons/md';
import {
  FiHome, FiList, FiPackage, FiSettings, FiUser,
  FiLogOut, FiMenu, FiX, FiChevronRight, FiKey
} from 'react-icons/fi';
import { authService } from '../services/authService';

const AdminLayout = ({ role }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Password change state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const navItems = role === 'superAdmin'
    ? [
        { to: '/superadmin', label: 'Dashboard', icon: <FiHome size={18} /> },
        { to: '/superadmin/canteens', label: 'Canteens', icon: <FiSettings size={18} /> },
        { to: '/superadmin/owners', label: 'Owners', icon: <FiUser size={18} /> },
        { to: '/superadmin/analytics', label: 'Analytics', icon: <FiList size={18} /> },
      ]
    : [
        { to: '/owner', label: 'Dashboard', icon: <FiHome size={18} /> },
        { to: '/owner/menu', label: 'Menu', icon: <FiList size={18} /> },
        { to: '/owner/orders', label: 'Orders', icon: <FiPackage size={18} /> },
        { to: '/owner/settings', label: 'Settings', icon: <FiSettings size={18} /> },
      ];

  const isActive = (path) => {
    if (path === '/owner' || path === '/superadmin') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast.error('All fields are required.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    try {
      setChangingPassword(true);
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed successfully.');
      setPasswordModalOpen(false);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
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
                {role === 'superAdmin' ? 'Super Admin' : 'Canteen Owner'}
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
          
          {/* Change Password Trigger */}
          <button
            onClick={() => setPasswordModalOpen(true)}
            id="admin-change-password-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '10px 14px', marginBottom: '4px',
              borderRadius: '12px', border: 'none',
              background: 'transparent', cursor: 'pointer',
              color: '#FF7A00', fontSize: '0.875rem', fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,122,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <FiKey size={17} />
            {sidebarOpen && 'Change Password'}
          </button>

          <button
            onClick={handleLogout}
            id="admin-logout-btn"
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
            {role === 'superAdmin' ? 'Super Admin' : 'Owner'}: <strong>{user?.name}</strong>
          </div>
        </header>

        <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(45, 52, 54, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 122, 0, 0.1)',
            position: 'relative',
          }}>
            <button
              onClick={() => setPasswordModalOpen(false)}
              style={{
                position: 'absolute', top: '24px', right: '24px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#636e72',
              }}
            >
              <FiX size={20} />
            </button>

            <h2 style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 700,
              fontSize: '1.5rem', color: '#2D3436', marginTop: 0, marginBottom: '8px',
            }}>
              Change Password
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#636e72', marginBottom: '24px', marginTop: 0 }}>
              Enter your current password and your new password to update.
            </p>

            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#2D3436', marginBottom: '6px' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                    border: '1.5px solid rgba(255,122,0,0.15)', background: '#FAF9F6',
                    fontSize: '0.9rem', color: '#2D3436', outline: 'none', transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#2D3436', marginBottom: '6px' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                    border: '1.5px solid rgba(255,122,0,0.15)', background: '#FAF9F6',
                    fontSize: '0.9rem', color: '#2D3436', outline: 'none', transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#2D3436', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                    border: '1.5px solid rgba(255,122,0,0.15)', background: '#FAF9F6',
                    fontSize: '0.9rem', color: '#2D3436', outline: 'none', transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    border: '1px solid rgba(255,122,0,0.2)', background: 'transparent',
                    color: '#636e72', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    border: 'none', background: 'linear-gradient(135deg, #FF7A00, #FFB703)',
                    color: 'white', fontWeight: 600, cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255,122,0,0.2)',
                  }}
                >
                  {changingPassword ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'white', color: '#2D3436',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
          },
        }}
      />
    </div>
  );
};

export default AdminLayout;

