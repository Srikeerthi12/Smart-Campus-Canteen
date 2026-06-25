import { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { menuService } from '../../services/menuService';
import { canteenService } from '../../services/canteenService';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import AdminStatCard from '../../components/admin/AdminStatCard';

const AnalyticsDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [canteens, setCanteens] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [o, m, c, ow] = await Promise.all([
          orderService.getAllOrders(),
          menuService.getAll(),
          canteenService.getAll(),
          adminService.getOwners(),
        ]);
        setOrders(o);
        setMenuItems(m);
        setCanteens(c);
        setOwners(ow);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  // Computed stats
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0);
  const statusCounts = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'].reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});
  const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const avgOrderValue = deliveredOrdersCount > 0 ? totalRevenue / deliveredOrdersCount : 0;

  // Orders per canteen
  const ordersPerCanteen = canteens.map(c => {
    const getCidStr = (cId) => (cId && typeof cId === 'object' ? cId._id?.toString() : cId?.toString()) || '';
    const targetCid = c._id?.toString();

    return {
      name: c.name,
      count: orders.filter(o => getCidStr(o.canteenId) === targetCid).length,
      revenue: orders
        .filter(o => getCidStr(o.canteenId) === targetCid && o.status === 'delivered')
        .reduce((s, o) => s + o.total, 0),
    };
  }).sort((a, b) => b.count - a.count);

  const STATUS_COLORS = {
    pending: '#F59E0B',
    preparing: '#3B82F6',
    ready: '#22C55E',
    delivered: '#6B7280',
    cancelled: '#EF4444',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.8rem', color: '#2D3436', marginBottom: '6px' }}>
          📊 Platform Analytics
        </h1>
        <p style={{ color: '#636e72', fontSize: '0.9rem' }}>
          Platform-wide statistics and performance overview
        </p>
      </div>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <AdminStatCard icon="📋" title="Total Orders" value={orders.length} color="#FF7A00" subtitle="All time" />
        <AdminStatCard icon="💰" title="Total Revenue" value={formatCurrency(totalRevenue)} color="#22C55E" subtitle="Excl. cancelled" />
        <AdminStatCard icon="📈" title="Avg Order Value" value={formatCurrency(avgOrderValue)} color="#3B82F6" subtitle="Per order" />
        <AdminStatCard icon="🏪" title="Canteens" value={canteens.length} color="#9C27B0" subtitle="On campus" />
        <AdminStatCard icon="👤" title="Owners" value={owners.length} color="#F59E0B" subtitle="Active managers" />
        <AdminStatCard icon="🍽️" title="Menu Items" value={menuItems.length} color="#EF4444" subtitle={`${menuItems.filter(i => i.isAvailable).length} available`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Orders by Status */}
        <div className="clay-card" style={{ padding: '24px' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#2D3436', marginBottom: '20px' }}>
            Orders by Status
          </h2>
          {loading ? <SkeletonCard /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(statusCounts).map(([status, count]) => {
                const pct = orders.length > 0 ? (count / orders.length) * 100 : 0;
                return (
                  <div key={status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600, color: '#2D3436', textTransform: 'capitalize' }}>{status}</span>
                      <span style={{ color: '#636e72' }}>{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: STATUS_COLORS[status],
                        borderRadius: '8px',
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Canteen Performance */}
        <div className="clay-card" style={{ padding: '24px' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#2D3436', marginBottom: '20px' }}>
            Canteen Performance
          </h2>
          {loading ? <SkeletonCard /> : ordersPerCanteen.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#636e72' }}>No data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ordersPerCanteen.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 16px',
                  background: i === 0 ? 'rgba(255,122,0,0.06)' : 'rgba(0,0,0,0.02)',
                  borderRadius: '12px',
                  border: i === 0 ? '1px solid rgba(255,122,0,0.12)' : '1px solid transparent',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                    background: i === 0 ? 'linear-gradient(135deg, #FF7A00, #FFB703)' : 'rgba(0,0,0,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.85rem',
                    color: i === 0 ? 'white' : '#636e72',
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2D3436', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#636e72' }}>
                      {c.count} orders
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#FF7A00', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                    {formatCurrency(c.revenue)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Menu items availability */}
      <div className="clay-card" style={{ padding: '24px' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#2D3436', marginBottom: '20px' }}>
          Menu Availability Overview
        </h2>
        {loading ? <SkeletonCard /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Available Items', value: menuItems.filter(i => i.isAvailable).length, color: '#22C55E', emoji: '✅' },
              { label: 'Out of Stock', value: menuItems.filter(i => !i.isAvailable).length, color: '#EF4444', emoji: '❌' },
              { label: 'Total Items', value: menuItems.length, color: '#FF7A00', emoji: '🍽️' },
              {
                label: 'Availability Rate',
                value: menuItems.length > 0 ? `${Math.round((menuItems.filter(i => i.isAvailable).length / menuItems.length) * 100)}%` : '0%',
                color: '#3B82F6', emoji: '📊',
              },
            ].map((stat, i) => (
              <div key={i} style={{
                padding: '20px',
                background: `${stat.color}0d`,
                borderRadius: '16px',
                border: `1px solid ${stat.color}25`,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{stat.emoji}</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#636e72', fontWeight: 500, marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
