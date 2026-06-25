import { formatCurrency } from '../../utils/formatters';
import { FiShoppingBag, FiMapPin, FiPhone } from 'react-icons/fi';

const OrderStatusBadge = ({ status }) => {
  const config = {
    pending:   { label: 'Pending',   emoji: '⏳', cls: 'badge-pending' },
    preparing: { label: 'Preparing', emoji: '👨‍🍳', cls: 'badge-preparing' },
    ready:     { label: 'Ready',     emoji: '✅', cls: 'badge-ready' },
    delivered: { label: 'Delivered', emoji: '📦', cls: 'badge-delivered' },
    cancelled: { label: 'Cancelled', emoji: '❌', cls: 'badge-cancelled' },
  };
  const s = config[status] || config.pending;
  return (
    <span className={`badge ${s.cls}`}>{s.emoji} {s.label}</span>
  );
};

const OrderCard = ({ order, onCancel }) => {
  const canCancel = order.status === 'pending';

  // canteenId may be populated (object) or just an ID string; fallback to canteenSnapshot if population failed
  const canteen = (order.canteenId && typeof order.canteenId === 'object')
    ? order.canteenId
    : (order.canteenSnapshot?.name ? order.canteenSnapshot : null);
  const canteenName = canteen?.name || null;

  return (
    <div className="clay-card" style={{ padding: '24px', marginBottom: '16px' }}>

      {/* ── Header: Order ID, date, status ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '16px',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, rgba(255,122,0,0.15), rgba(255,183,3,0.15))',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiShoppingBag size={18} color="#FF7A00" />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2D3436' }}>
                Order #{order._id?.slice(-8).toUpperCase()}
              </span>
              <div style={{ fontSize: '0.78rem', color: '#636e72' }}>
                {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
          </div>

          {/* Canteen name — inline under the order ID for quick scanning */}
          {canteenName ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              marginTop: '6px',
              background: 'linear-gradient(135deg, rgba(255,122,0,0.12), rgba(255,183,3,0.08))',
              border: '1px solid rgba(255,122,0,0.2)',
              borderRadius: '20px',
              padding: '4px 12px',
            }}>
              <span style={{ fontSize: '0.8rem' }}>🍽️</span>
              <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#FF7A00' }}>
                {canteenName}
              </span>
              {canteen?.location && (
                <>
                  <span style={{ color: '#dfe6e9' }}>·</span>
                  <FiMapPin size={11} color="#b2bec3" />
                  <span style={{ fontSize: '0.78rem', color: '#636e72' }}>{canteen.location}</span>
                </>
              )}
            </div>
          ) : (
            /* Fallback: shown while canteenId is unpopulated (e.g., old orders) */
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              marginTop: '6px',
              background: 'rgba(0,0,0,0.04)',
              borderRadius: '20px',
              padding: '4px 12px',
            }}>
              <span style={{ fontSize: '0.78rem', color: '#b2bec3' }}>🍽️ Canteen info unavailable</span>
            </div>
          )}
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      {/* ── Order Items ── */}
      <div style={{
        background: 'rgba(255,122,0,0.04)',
        borderRadius: '14px', padding: '14px',
        marginBottom: '16px',
      }}>
        <div style={{
          fontSize: '0.7rem', fontWeight: 700, color: '#b2bec3',
          textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px',
        }}>
          Items Ordered
        </div>
        {order.items?.map((item, i) => (
          <div key={item._id || i} style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 0',
            borderBottom: i < order.items.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
          }}>
            <span style={{ fontSize: '0.875rem', color: '#2D3436', fontWeight: 500 }}>
              {item.name || 'Menu Item'} × {order.quantities?.[i] || 1}
            </span>
            <span style={{ fontSize: '0.875rem', color: '#636e72' }}>
              {formatCurrency((item.price || 0) * (order.quantities?.[i] || 1))}
            </span>
          </div>
        ))}
      </div>

      {/* ── Footer: special instructions + cancel + total ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {canteen?.contactPhone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#b2bec3', marginBottom: '6px' }}>
              <FiPhone size={11} color="#b2bec3" />
              {canteen.contactPhone}
            </div>
          )}
          {order.specialInstructions && (
            <p style={{ fontSize: '0.8rem', color: '#636e72', fontStyle: 'italic', margin: 0 }}>
              "{order.specialInstructions}"
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {canCancel && onCancel && (
            <button
              id={`cancel-order-${order._id}`}
              className="btn-danger"
              style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '10px' }}
              onClick={() => onCancel(order._id)}
            >
              Cancel
            </button>
          )}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#636e72', marginBottom: '2px' }}>Total</div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#FF7A00' }}>
              {formatCurrency(order.total)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { OrderStatusBadge };
export default OrderCard;
