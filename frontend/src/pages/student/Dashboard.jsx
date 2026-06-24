import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { canteenService } from '../../services/canteenService';
import { orderService } from '../../services/orderService';
import { getCanteenStatus } from '../../utils/canteenUtils';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import { OrderStatusBadge } from '../../components/orders/OrderCard';
import { FiArrowRight, FiShoppingBag, FiClock } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';

const Dashboard = () => {
  const { user } = useAuth();
  const { getTotalItems, getTotalPrice } = useCart();
  const [canteens, setCanteens] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, o] = await Promise.all([
          canteenService.getAll(),
          orderService.getMyOrders(),
        ]);
        setCanteens(c);
        setOrders(o);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const openCanteens = canteens.filter(c => getCanteenStatus(c.openTime, c.closeTime).isOpen);
  const activeOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));
  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌅 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening';

  return (
    <div style={{ padding: '32px 0' }}>
      <div className="container">
        {/* Welcome */}
        <div className="clay-card" style={{
          padding: '32px',
          background: 'linear-gradient(135deg, #FF7A00, #FFB703)',
          color: 'white', marginBottom: '32px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '8px', opacity: 0.9 }}>{greeting},</p>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: 'white', marginBottom: '16px' }}>
              {user?.name} 👋
            </h1>
            <p style={{ opacity: 0.85, fontSize: '0.95rem', marginBottom: '24px' }}>
              {openCanteens.length} canteen{openCanteens.length !== 1 ? 's' : ''} open right now
            </p>
            <Link to="/canteens" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'white', color: '#FF7A00',
              fontWeight: 700, padding: '12px 24px', borderRadius: '14px',
              textDecoration: 'none', fontSize: '0.9rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Browse Canteens <FiArrowRight />
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {[
            { emoji: '🏪', label: 'Open Now', value: openCanteens.length, color: '#22C55E' },
            { emoji: '📦', label: 'Active Orders', value: activeOrders.length, color: '#3B82F6' },
            { emoji: '🛒', label: 'Cart Items', value: getTotalItems(), color: '#FF7A00' },
            { emoji: '📋', label: 'Total Orders', value: orders.length, color: '#9C27B0' },
          ].map((stat, i) => (
            <div key={i} className="clay-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-15px', top: '-15px', width: '70px', height: '70px', borderRadius: '50%', background: `${stat.color}15` }} />
              <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>{stat.emoji}</div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '2rem', color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.78rem', color: '#636e72', fontWeight: 500, marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Open Canteens */}
          <div className="clay-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#2D3436' }}>
                🟢 Open Canteens
              </h2>
              <Link to="/canteens" style={{ color: '#FF7A00', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>View all</Link>
            </div>
            {loading ? (
              <><SkeletonCard /><SkeletonCard /></>
            ) : openCanteens.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#636e72', fontSize: '0.9rem' }}>
                😴 No canteens open right now
              </div>
            ) : (
              openCanteens.slice(0, 4).map(c => (
                <Link key={c._id} to={`/canteens/${c._id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.paddingLeft = '6px'}
                    onMouseLeave={e => e.currentTarget.style.paddingLeft = '0'}
                  >
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(255,122,0,0.15), rgba(255,183,3,0.15))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <MdRestaurant size={20} color="#FF7A00" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2D3436' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#636e72', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiClock size={11} />{c.openTime} – {c.closeTime}
                      </div>
                    </div>
                    <FiArrowRight size={14} color="#b2bec3" />
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Recent Orders */}
          <div className="clay-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#2D3436' }}>
                📦 Recent Orders
              </h2>
              <Link to="/orders" style={{ color: '#FF7A00', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>View all</Link>
            </div>
            {loading ? (
              <><SkeletonCard /></>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#636e72', fontSize: '0.9rem' }}>
                🍽️ No orders yet.<br />
                <Link to="/canteens" style={{ color: '#FF7A00', fontWeight: 600, textDecoration: 'none' }}>Browse canteens →</Link>
              </div>
            ) : (
              orders.slice(0, 4).map(order => (
                <div key={order._id} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                    background: 'rgba(255,122,0,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FiShoppingBag size={18} color="#FF7A00" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#2D3436' }}>
                      #{order._id?.slice(-6).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#636e72' }}>
                      {formatCurrency(order.total)} · {formatRelativeTime(order.createdAt)}
                    </div>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cart reminder */}
        {getTotalItems() > 0 && (
          <div className="clay-card" style={{
            padding: '20px 24px', marginTop: '24px',
            background: 'linear-gradient(135deg, rgba(255,122,0,0.08), rgba(255,183,3,0.08))',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
          }}>
            <div>
              <span style={{ fontWeight: 700, color: '#2D3436' }}>🛒 You have {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your cart</span>
              <span style={{ color: '#636e72', fontSize: '0.9rem', marginLeft: '8px' }}>({formatCurrency(getTotalPrice())})</span>
            </div>
            <Link to="/cart" className="btn-primary" style={{ padding: '10px 20px' }}>
              Go to Cart <FiArrowRight />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
