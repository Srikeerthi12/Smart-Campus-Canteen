import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { authService } from '../../services/authService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { FiUser, FiMail, FiShield, FiCalendar, FiPackage, FiDollarSign, FiLock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    orderService.getMyOrders().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password updated successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const totalSpent = orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + o.total : sum, 0);
  const completedOrders = orders.filter(o => o.status === 'delivered').length;

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '760px' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2rem', color: '#2D3436', marginBottom: '32px' }}>
          👤 My Profile
        </h1>

        {/* Avatar + Name */}
        <div className="clay-card" style={{ padding: '32px', marginBottom: '24px', textAlign: 'center' }}>
          <div style={{
            width: '96px', height: '96px',
            background: 'linear-gradient(135deg, #FF7A00, #FFB703)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '2.5rem', fontWeight: 800, color: 'white',
            fontFamily: 'Outfit, sans-serif',
            boxShadow: '0 8px 32px rgba(255,122,0,0.35)',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#2D3436', marginBottom: '6px' }}>{user?.name}</h2>
          <p style={{ color: '#636e72', marginBottom: '16px' }}>{user?.email}</p>
          <span className={`badge ${user?.role === 'admin' ? 'badge-preparing' : 'badge-open'}`} style={{ fontSize: '0.82rem' }}>
            {user?.role === 'admin' ? '👨‍💼 Admin' : '🎓 Student'}
          </span>
        </div>

        {/* Stats */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { icon: <FiPackage size={20} color="#FF7A00" />, label: 'Total Orders', value: orders.length },
              { icon: '✅', label: 'Completed', value: completedOrders },
              { icon: <FiDollarSign size={20} color="#22C55E" />, label: 'Total Spent', value: formatCurrency(totalSpent) },
            ].map((s, i) => (
              <div key={i} className="clay-card" style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#2D3436' }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', color: '#636e72', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Info card */}
        <div className="clay-card" style={{ padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#2D3436', marginBottom: '20px' }}>
            Account Information
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: <FiUser size={16} color="#FF7A00" />, label: 'Full Name', value: user?.name },
              { icon: <FiMail size={16} color="#FF7A00" />, label: 'Email Address', value: user?.email },
              { icon: <FiShield size={16} color="#FF7A00" />, label: 'Role', value: user?.role === 'admin' ? 'Canteen Administrator' : 'Student' },
            ].map((field, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '14px 16px',
                background: 'rgba(255,122,0,0.03)', borderRadius: '12px',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(255,122,0,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {field.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#636e72', fontWeight: 500, marginBottom: '2px' }}>{field.label}</div>
                  <div style={{ fontWeight: 600, color: '#2D3436', fontSize: '0.95rem' }}>{field.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="clay-card" style={{ padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#2D3436', marginBottom: '20px' }}>
            🔒 Change Password
          </h3>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                id="current-password"
                type="password"
                className="input-field"
                placeholder="Enter current password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                id="new-password"
                type="password"
                className="input-field"
                placeholder="Enter new password (min. 6 chars)"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                className="input-field"
                placeholder="Confirm new password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                required
              />
            </div>
            <button
              id="change-password-submit"
              type="submit"
              className="btn-primary"
              disabled={changingPassword}
              style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
            >
              {changingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/orders" className="btn-secondary" style={{ flex: 1, justifyContent: 'center', minWidth: '160px' }}>
            <FiPackage size={16} /> View Orders
          </Link>
          <button
            id="profile-logout-btn"
            onClick={logout}
            className="btn-danger"
            style={{ flex: 1, justifyContent: 'center', minWidth: '160px' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
