import { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { OrderStatusBadge } from '../../components/orders/OrderCard';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { SkeletonList } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiChevronDown, FiFilter, FiX, FiUser, FiMapPin, FiPhone } from 'react-icons/fi';

const STATUSES = ['all', 'pending', 'preparing', 'ready', 'delivered', 'cancelled'];
const NEXT_STATUSES = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivered'],
  delivered: [],
  cancelled: [],
};

const statusColors = {
  pending:   '#f59e0b',
  preparing: '#3b82f6',
  ready:     '#10b981',
  delivered: '#6366f1',
  cancelled: '#ef4444',
};

/* ────────────────────────────────────────────────────────────
   Inline detail sections
──────────────────────────────────────────────────────────── */
const SectionHeader = ({ title }) => (
  <h4 style={{
    fontWeight: 700, fontSize: '0.72rem', color: '#b2bec3',
    textTransform: 'uppercase', letterSpacing: '0.07em',
    marginBottom: '10px', marginTop: 0,
  }}>
    {title}
  </h4>
);

const CustomerSection = ({ user }) => {
  if (!user || typeof user !== 'object') return (
    <div style={{ fontSize: '0.85rem', color: '#b2bec3' }}>No customer info</div>
  );
  return (
    <div style={{
      background: 'rgba(99,110,242,0.06)', borderRadius: '12px',
      padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
        }}>
          {user.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#2D3436' }}>{user.name || 'Unknown'}</div>
          <div style={{ fontSize: '0.78rem', color: '#636e72' }}>{user.email || '—'}</div>
        </div>
      </div>
    </div>
  );
};

const CanteenSection = ({ canteen }) => {
  if (!canteen || typeof canteen !== 'object') return (
    <div style={{ fontSize: '0.85rem', color: '#b2bec3' }}>No canteen info</div>
  );
  return (
    <div style={{
      background: 'rgba(255,122,0,0.06)', borderRadius: '12px',
      padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px',
    }}>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2D3436' }}>
        🍽️ {canteen.name}
      </div>
      {canteen.location && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#636e72' }}>
          <FiMapPin size={12} color="#FF7A00" /> {canteen.location}
        </div>
      )}
      {canteen.contactPhone && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#636e72' }}>
          <FiPhone size={12} color="#FF7A00" /> {canteen.contactPhone}
        </div>
      )}
    </div>
  );
};

const ItemsSection = ({ items, quantities }) => (
  <div>
    {items?.length ? items.map((item, i) => (
      <div key={i} style={{
        display: 'flex', justifyContent: 'space-between',
        padding: '7px 0', fontSize: '0.875rem',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
      }}>
        <span style={{ color: '#2D3436', fontWeight: 500 }}>
          {item.name || 'Item'} <span style={{ color: '#b2bec3' }}>×</span> {quantities?.[i] || 1}
        </span>
        <span style={{ color: '#636e72' }}>
          {formatCurrency((item.price || 0) * (quantities?.[i] || 1))}
        </span>
      </div>
    )) : <div style={{ fontSize: '0.85rem', color: '#b2bec3' }}>No items</div>}
  </div>
);

/* ────────────────────────────────────────────────────────────
   Main component
──────────────────────────────────────────────────────────── */
const OrderManagement = () => {
  const { isAdmin } = useAuth();
  const adminMode = isAdmin();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Admin filter state
  const [adminFilters, setAdminFilters] = useState({
    canteenId: '',
    studentId: '',
    dateFrom: '',
    dateTo: '',
  });
  const [activeAdminFilters, setActiveAdminFilters] = useState({});

  const fetchOrders = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrders(filters);
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch {
      toast.error('Failed to load orders');
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await orderService.updateStatus(orderId, newStatus);
      toast.success(`Order updated to: ${newStatus}`);
      fetchOrders(activeAdminFilters);
    } catch {
      toast.error('Failed to update status');
    }
    setUpdatingId(null);
  };

  const applyFilters = () => {
    const f = {};
    if (adminFilters.canteenId.trim()) f.canteenId = adminFilters.canteenId.trim();
    if (adminFilters.studentId.trim()) f.studentId = adminFilters.studentId.trim();
    if (adminFilters.dateFrom) f.dateFrom = adminFilters.dateFrom;
    if (adminFilters.dateTo) f.dateTo = adminFilters.dateTo;
    setActiveAdminFilters(f);
    fetchOrders(f);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setAdminFilters({ canteenId: '', studentId: '', dateFrom: '', dateTo: '' });
    setActiveAdminFilters({});
    fetchOrders({});
    setShowFilters(false);
  };

  const hasActiveFilters = Object.keys(activeAdminFilters).length > 0;

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.8rem', color: '#2D3436', marginBottom: '4px' }}>
            Order Management
          </h1>
          <p style={{ color: '#636e72', fontSize: '0.875rem' }}>
            {orders.filter(o => o.status === 'pending').length} pending ·{' '}
            {orders.filter(o => o.status === 'preparing').length} preparing ·{' '}
            {orders.length} total
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {adminMode && (
            <button
              id="filter-orders-btn"
              onClick={() => setShowFilters(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', borderRadius: '12px', border: 'none',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                background: hasActiveFilters
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'white',
                color: hasActiveFilters ? 'white' : '#636e72',
                boxShadow: hasActiveFilters
                  ? '0 4px 14px rgba(99,102,241,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s',
              }}
            >
              <FiFilter size={15} />
              {hasActiveFilters ? 'Filters Active' : 'Filter'}
            </button>
          )}
          <button
            className="btn-secondary"
            onClick={() => fetchOrders(activeAdminFilters)}
            id="refresh-orders-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiRefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Admin Filter Panel ── */}
      {adminMode && showFilters && (
        <div style={{
          background: 'white', borderRadius: '16px', padding: '20px 24px',
          marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(99,102,241,0.15)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#2D3436', margin: 0 }}>
              Filter Orders
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b2bec3', padding: '4px' }}
            >
              <FiX size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '18px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#636e72', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Canteen ID / Name
              </label>
              <input
                id="filter-canteen-id"
                type="text"
                placeholder="Paste canteen ID..."
                value={adminFilters.canteenId}
                onChange={e => setAdminFilters(f => ({ ...f, canteenId: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px',
                  border: '1.5px solid rgba(0,0,0,0.1)', fontSize: '0.875rem',
                  outline: 'none', color: '#2D3436', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#636e72', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Student ID
              </label>
              <input
                id="filter-student-id"
                type="text"
                placeholder="Paste student ID..."
                value={adminFilters.studentId}
                onChange={e => setAdminFilters(f => ({ ...f, studentId: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px',
                  border: '1.5px solid rgba(0,0,0,0.1)', fontSize: '0.875rem',
                  outline: 'none', color: '#2D3436', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#636e72', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Date From
              </label>
              <input
                id="filter-date-from"
                type="date"
                value={adminFilters.dateFrom}
                onChange={e => setAdminFilters(f => ({ ...f, dateFrom: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px',
                  border: '1.5px solid rgba(0,0,0,0.1)', fontSize: '0.875rem',
                  outline: 'none', color: '#2D3436', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#636e72', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Date To
              </label>
              <input
                id="filter-date-to"
                type="date"
                value={adminFilters.dateTo}
                onChange={e => setAdminFilters(f => ({ ...f, dateTo: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px',
                  border: '1.5px solid rgba(0,0,0,0.1)', fontSize: '0.875rem',
                  outline: 'none', color: '#2D3436', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              id="apply-filters-btn"
              onClick={applyFilters}
              style={{
                padding: '10px 24px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
              }}
            >
              Apply Filters
            </button>
            {hasActiveFilters && (
              <button
                id="clear-filters-btn"
                onClick={clearFilters}
                style={{
                  padding: '10px 24px', borderRadius: '12px', border: 'none',
                  background: 'rgba(239,68,68,0.1)',
                  color: '#ef4444', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                }}
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Status Filter tabs ── */}
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

      {/* ── Orders list ── */}
      <div className="clay-card" style={{ overflow: 'hidden' }}>
        {loading ? <SkeletonList /> : filtered.length === 0 ? (
          <EmptyState icon="📦" title="No orders" message={`No ${filter === 'all' ? '' : filter} orders found.`} />
        ) : (
          <div>
            {filtered.map(order => {
              const student = (typeof order.user === 'object' && order.user !== null) ? order.user : (order.userSnapshot?.name ? order.userSnapshot : null);
              const canteen = (typeof order.canteenId === 'object' && order.canteenId !== null) ? order.canteenId : (order.canteenSnapshot?.name ? order.canteenSnapshot : null);

              return (
                <div key={order._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>

                  {/* ── Collapsed row ── */}
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '16px 24px', cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,122,0,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Order ID + date */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#2D3436', fontFamily: 'monospace' }}>
                        #{order._id?.slice(-8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#636e72' }}>
                        {formatDateTime(order.createdAt)} · {order.items?.length || 0} item(s)
                      </div>
                    </div>

                    {/* Student name — always visible for owner & admin */}
                    <div style={{ minWidth: '140px' }}>
                      {student ? (
                        <div style={{
                          display: 'inline-flex', flexDirection: 'column', gap: '2px',
                          background: 'rgba(99,102,241,0.08)', borderRadius: '10px',
                          padding: '6px 10px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FiUser size={11} color="#6366f1" />
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2D3436' }}>
                              {student.name}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#636e72', paddingLeft: '16px' }}>
                            {student.email}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#b2bec3', fontStyle: 'italic' }}>No student info</span>
                      )}
                    </div>

                    {/* Canteen name — admin only */}
                    {adminMode && (
                      <div style={{ minWidth: '120px' }}>
                        {canteen ? (
                          <div style={{
                            display: 'inline-flex', flexDirection: 'column', gap: '2px',
                            background: 'rgba(255,122,0,0.08)', borderRadius: '10px',
                            padding: '6px 10px',
                          }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FF7A00' }}>
                              🍽️ {canteen.name}
                            </div>
                            {canteen.location && (
                              <div style={{ fontSize: '0.72rem', color: '#636e72' }}>{canteen.location}</div>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#b2bec3', fontStyle: 'italic' }}>No canteen info</span>
                        )}
                      </div>
                    )}

                    {/* Total */}
                    <div style={{ minWidth: '80px', textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#FF7A00', fontSize: '0.95rem' }}>
                        {formatCurrency(order.total)}
                      </div>
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

                  {/* ── Expanded detail panel ── */}
                  {expandedId === order._id && (
                    <div style={{
                      padding: '0 24px 24px',
                      borderTop: '1px solid rgba(0,0,0,0.04)',
                      background: 'rgba(255,122,0,0.015)',
                      animation: 'fadeIn 0.2s ease',
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: adminMode ? '1fr 1fr 1fr' : '1fr 2fr',
                        gap: '20px',
                        paddingTop: '20px',
                      }}>

                        {/* Customer Details */}
                        <div>
                          <SectionHeader title="👤 Customer Details" />
                          <CustomerSection user={student} />
                        </div>

                        {/* Canteen Details — admin only */}
                        {adminMode && (
                          <div>
                            <SectionHeader title="🍽️ Canteen Details" />
                            <CanteenSection canteen={canteen} />
                          </div>
                        )}

                        {/* Order Items */}
                        <div style={{ gridColumn: adminMode ? '3' : '2' }}>
                          <SectionHeader title="🛒 Order Items" />
                          <ItemsSection items={order.items} quantities={order.quantities} />
                          {order.specialInstructions && (
                            <div style={{
                              marginTop: '12px',
                              background: 'rgba(255,122,0,0.06)',
                              borderRadius: '10px', padding: '10px 14px',
                              fontSize: '0.85rem', color: '#636e72', fontStyle: 'italic',
                            }}>
                              "{order.specialInstructions}"
                            </div>
                          )}
                          <div style={{
                            display: 'flex', justifyContent: 'flex-end',
                            marginTop: '14px', paddingTop: '12px',
                            borderTop: '1px solid rgba(0,0,0,0.06)',
                          }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.72rem', color: '#b2bec3', marginBottom: '2px' }}>Total Amount</div>
                              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#FF7A00' }}>
                                {formatCurrency(order.total)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
