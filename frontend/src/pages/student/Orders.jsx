import { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import OrderCard from '../../components/orders/OrderCard';
import { SkeletonList } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUSES = ['all', 'pending', 'preparing', 'ready', 'delivered', 'cancelled'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await orderService.cancelOrder(orderId);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch {
      toast.error('Could not cancel order');
    }
  };

  const filtered = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2rem', color: '#2D3436', marginBottom: '8px' }}>
          📦 My Orders
        </h1>
        <p style={{ color: '#636e72', fontSize: '0.9rem', marginBottom: '32px' }}>
          Track all your orders and their statuses
        </p>

        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '28px',
          overflowX: 'auto', paddingBottom: '4px',
          scrollbarWidth: 'none',
        }}>
          {STATUSES.map(s => (
            <button
              key={s}
              id={`tab-${s}`}
              onClick={() => setActiveTab(s)}
              style={{
                padding: '10px 18px', borderRadius: '12px', border: 'none',
                fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: activeTab === s ? 'linear-gradient(135deg, #FF7A00, #FFB703)' : 'white',
                color: activeTab === s ? 'white' : '#636e72',
                boxShadow: activeTab === s ? '0 4px 14px rgba(255,122,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s',
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {statusCounts[s] > 0 && (
                <span style={{
                  marginLeft: '6px',
                  background: activeTab === s ? 'rgba(255,255,255,0.25)' : 'rgba(255,122,0,0.12)',
                  color: activeTab === s ? 'white' : '#FF7A00',
                  borderRadius: '10px', padding: '1px 7px', fontSize: '0.75rem',
                }}>{statusCounts[s]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="clay-card" style={{ padding: '0' }}><SkeletonList /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={activeTab === 'all' ? '📦' : '🔍'}
            title={activeTab === 'all' ? "No orders yet" : `No ${activeTab} orders`}
            message={activeTab === 'all' ? "Order from a canteen and track your food here." : `You don't have any ${activeTab} orders.`}
            action={activeTab === 'all' ? <Link to="/canteens" className="btn-primary">Browse Canteens</Link> : <button className="btn-secondary" onClick={() => setActiveTab('all')}>Show All Orders</button>}
          />
        ) : (
          <div className="animate-fade-in">
            {filtered.map(order => (
              <OrderCard key={order._id} order={order} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
