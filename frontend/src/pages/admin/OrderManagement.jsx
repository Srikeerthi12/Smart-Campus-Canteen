import { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { OrderStatusBadge } from '../../components/orders/OrderCard';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { SkeletonList } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiChevronDown } from 'react-icons/fi';

const STATUSES = ['all', 'pending', 'preparing', 'ready', 'delivered', 'cancelled'];
const NEXT_STATUSES = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivered'],
  delivered: [],
  cancelled: [],
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrders();
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch { toast.error('Failed to load orders'); }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await orderService.updateStatus(orderId, newStatus);
      toast.success(`Order updated to: ${newStatus}`);
      fetchOrders();
    } catch { toast.error('Failed to update status'); }
    setUpdatingId(null);
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.8rem', color: '#2D3436', marginBottom: '4px' }}>Order Management</h1>
          <p style={{ color: '#636e72', fontSize: '0.875rem' }}>
            {orders.filter(o => o.status === 'pending').length} pending · {orders.filter(o => o.status === 'preparing').length} preparing
          </p>
        </div>
        <button className="btn-secondary" onClick={fetchOrders} id="refresh-orders-btn">
          <FiRefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        {STATUSES.map(s => (
          <button
            key={s}
            id={`admin-tab-${s}`}
            onClick={() => setFilter(s)}
            style={{
              padding: '10px 18px', borderRadius: '12px', border: 'none',
              fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap',
              background: filter === s ? 'linear-gradient(135deg, #FF7A00, #FFB703)' : 'white',
              color: filter === s ? 'white' : '#636e72',
              boxShadow: filter === s ? '0 4px 14px rgba(255,122,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.2s',
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {counts[s] > 0 && (
              <span style={{
                marginLeft: '6px',
                background: filter === s ? 'rgba(255,255,255,0.25)' : 'rgba(255,122,0,0.12)',
                color: filter === s ? 'white' : '#FF7A00',
                borderRadius: '10px', padding: '1px 7px', fontSize: '0.75rem',
              }}>{counts[s]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="clay-card" style={{ overflow: 'hidden' }}>
        {loading ? <SkeletonList /> : filtered.length === 0 ? (
          <EmptyState icon="📦" title="No orders" message={`No ${filter === 'all' ? '' : filter} orders found.`} />
        ) : (
          <div>
            {filtered.map(order => (
              <div key={order._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                {/* Main row */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px 24px', cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,122,0,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#2D3436', fontFamily: 'monospace' }}>
                      #{order._id?.slice(-8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#636e72' }}>
                      {formatDateTime(order.createdAt)} · {order.items?.length || 0} item(s)
                    </div>
                  </div>

                  <div style={{ minWidth: '80px', textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#FF7A00', fontSize: '0.95rem' }}>{formatCurrency(order.total)}</div>
                  </div>

                  <OrderStatusBadge status={order.status} />

                  {/* Status update dropdown */}
                  {NEXT_STATUSES[order.status]?.length > 0 && (
                    <select
                      id={`status-select-${order._id}`}
                      style={{
                        padding: '8px 12px', borderRadius: '10px',
                        border: '1.5px solid rgba(255,122,0,0.2)',
                        fontSize: '0.8rem', cursor: 'pointer', color: '#2D3436',
                        background: 'white', outline: 'none',
                        opacity: updatingId === order._id ? 0.5 : 1,
                      }}
                      value=""
                      onChange={e => { if (e.target.value) handleStatusUpdate(order._id, e.target.value); }}
                      onClick={e => e.stopPropagation()}
                      disabled={updatingId === order._id}
                    >
                      <option value="">Update Status</option>
                      {NEXT_STATUSES[order.status].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  )}

                  <FiChevronDown
                    size={16} color="#b2bec3"
                    style={{ transform: expandedId === order._id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', flexShrink: 0 }}
                  />
                </div>

                {/* Expanded */}
                {expandedId === order._id && (
                  <div style={{
                    padding: '0 24px 20px',
                    borderTop: '1px solid rgba(0,0,0,0.04)',
                    background: 'rgba(255,122,0,0.02)',
                    animation: 'fadeIn 0.2s ease',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingTop: '16px' }}>
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#636e72', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</h4>
                        {order.items?.map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.875rem', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                            <span style={{ color: '#2D3436' }}>{item.name || 'Item'} × {order.quantities?.[i] || 1}</span>
                            <span style={{ color: '#636e72' }}>{formatCurrency((item.price || 0) * (order.quantities?.[i] || 1))}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        {order.specialInstructions && (
                          <div>
                            <h4 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#636e72', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Special Instructions</h4>
                            <p style={{ fontSize: '0.875rem', color: '#2D3436', fontStyle: 'italic', background: 'rgba(255,122,0,0.06)', padding: '10px', borderRadius: '10px' }}>
                              "{order.specialInstructions}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
