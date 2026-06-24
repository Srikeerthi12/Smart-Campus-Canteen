import { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { menuService } from '../../services/menuService';
import { canteenService } from '../../services/canteenService';
import { useAuth } from '../../context/AuthContext';
import AdminStatCard from '../../components/admin/AdminStatCard';
import { OrderStatusBadge } from '../../components/orders/OrderCard';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const AdminDashboard = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'canteenOwner';
  const base = isOwner ? '/owner' : '/superadmin';
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [o, m, c] = await Promise.all([
          orderService.getAllOrders(),
          menuService.getAll(),
          canteenService.getAll(),
        ]);
        setOrders(o.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setMenuItems(m);
        setCanteens(c);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const pending = orders.filter(o => o.status === 'pending').length;
  const preparing = orders.filter(o => o.status === 'preparing').length;
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.8rem', color: '#2D3436', marginBottom: '6px' }}>
          Dashboard Overview
        </h1>
        <p style={{ color: '#636e72', fontSize: '0.9rem' }}>Welcome to the CampusEats admin panel</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <AdminStatCard icon="📋" title="Total Orders" value={orders.length} color="#FF7A00" subtitle="All time" />
        <AdminStatCard icon="⏳" title="Pending Orders" value={pending} color="#F59E0B" subtitle="Need attention" />
        <AdminStatCard icon="👨‍🍳" title="Preparing" value={preparing} color="#3B82F6" subtitle="In kitchen" />
        <AdminStatCard icon="🍽️" title="Menu Items" value={menuItems.length} color="#22C55E" subtitle={`${menuItems.filter(i => i.isAvailable).length} available`} />
        <AdminStatCard icon="🏪" title="Canteens" value={canteens.length} color="#9C27B0" subtitle="On campus" />
        <AdminStatCard icon="💰" title="Total Revenue" value={formatCurrency(totalRevenue)} color="#EF4444" subtitle="Excl. cancelled" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        {/* Recent orders */}
        <div className="clay-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#2D3436' }}>Recent Orders</h2>
            <Link to={`${base}/orders`} style={{ color: '#FF7A00', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <FiArrowRight size={14} />
            </Link>
          </div>
          {loading ? <SkeletonCard /> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 8).map(order => (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.82rem' }}>
                        #{order._id?.slice(-8).toUpperCase()}
                      </td>
                      <td style={{ color: '#636e72' }}>{order.items?.length || 0} item(s)</td>
                      <td style={{ fontWeight: 600, color: '#FF7A00' }}>{formatCurrency(order.total)}</td>
                      <td style={{ color: '#636e72', fontSize: '0.82rem' }}>{formatRelativeTime(order.createdAt)}</td>
                      <td><OrderStatusBadge status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: '#636e72' }}>No orders yet</div>
              )}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="clay-card" style={{ padding: '24px' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#2D3436', marginBottom: '20px' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(isOwner ? [
              { to: `${base}/menu`, icon: '🍽️', label: 'Add Menu Item', desc: 'Create new food item' },
              { to: `${base}/orders`, icon: '📦', label: 'Manage Orders', desc: `${pending} pending orders` },
              { to: `${base}/settings`, icon: '🏪', label: 'Canteen Settings', desc: 'Update timings & info' },
            ] : [
              { to: `${base}/canteens`, icon: '🏪', label: 'Manage Canteens', desc: `${canteens.length} canteens` },
              { to: `${base}/owners`, icon: '👤', label: 'Manage Owners', desc: 'Owner accounts' },
              { to: `${base}/analytics`, icon: '📊', label: 'Analytics', desc: 'Platform statistics' },
            ]).map(a => (
              <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 16px', borderRadius: '14px',
                  background: 'rgba(255,122,0,0.04)',
                  border: '1px solid rgba(255,122,0,0.08)',
                  transition: 'all 0.2s', cursor: 'pointer',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,122,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,122,0,0.04)'}
                >
                  <span style={{ fontSize: '1.5rem' }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2D3436' }}>{a.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#636e72' }}>{a.desc}</div>
                  </div>
                  <FiArrowRight size={14} color="#b2bec3" />
                </div>
              </Link>
            ))}
          </div>

          {/* Low stock alert */}
          {menuItems.filter(i => !i.isAvailable).length > 0 && (
            <div style={{
              marginTop: '20px', padding: '14px',
              background: 'rgba(239,68,68,0.06)',
              borderRadius: '12px',
              border: '1px solid rgba(239,68,68,0.15)',
            }}>
              <p style={{ fontSize: '0.82rem', color: '#EF4444', fontWeight: 600, marginBottom: '4px' }}>
                ⚠️ {menuItems.filter(i => !i.isAvailable).length} items out of stock
              </p>
              <Link to={`${base}/menu`} style={{ fontSize: '0.78rem', color: '#EF4444', textDecoration: 'underline' }}>
                Manage availability →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
