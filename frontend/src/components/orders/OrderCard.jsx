import { formatCurrency } from '../../utils/formatters';
import { FiShoppingBag } from 'react-icons/fi';

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

  return (
    <div className="clay-card" style={{ padding: '24px', marginBottom: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
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
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div style={{
        background: 'rgba(255,122,0,0.04)',
        borderRadius: '14px', padding: '14px',
        marginBottom: '16px',
      }}>
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
              {formatCurrency(item.price * (order.quantities?.[i] || 1))}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {order.specialInstructions && (
            <p style={{ fontSize: '0.8rem', color: '#636e72', fontStyle: 'italic' }}>
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
