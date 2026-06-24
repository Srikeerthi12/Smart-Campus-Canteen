import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';
import { FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';

const CartItem = ({ item }) => {
  const { addItem, removeItem, updateQuantity } = useCart();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '16px 0',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
    }}>
      {/* Thumbnail */}
      <div style={{
        width: '64px', height: '64px', flexShrink: 0,
        borderRadius: '12px', overflow: 'hidden',
        background: 'rgba(255,122,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '1.5rem' }}>🍽️</span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontWeight: 600, fontSize: '0.95rem', color: '#2D3436', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.name}
        </h4>
        <span style={{ fontWeight: 700, color: '#FF7A00', fontSize: '0.9rem' }}>
          {formatCurrency(item.price)}
        </span>
      </div>

      {/* Qty controls */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(255,122,0,0.06)',
        borderRadius: '12px', padding: '6px 10px',
      }}>
        <button className="btn-icon" style={{ width: '28px', height: '28px', borderRadius: '8px' }}
          onClick={() => updateQuantity(item._id, item.quantity - 1)}>
          <FiMinus size={13} />
        </button>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#2D3436', minWidth: '20px', textAlign: 'center' }}>
          {item.quantity}
        </span>
        <button className="btn-icon" style={{ width: '28px', height: '28px', borderRadius: '8px' }}
          onClick={() => addItem(item)}>
          <FiPlus size={13} />
        </button>
      </div>

      {/* Subtotal */}
      <div style={{ textAlign: 'right', minWidth: '80px' }}>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#2D3436' }}>
          {formatCurrency(item.price * item.quantity)}
        </span>
      </div>

      {/* Remove */}
      <button
        className="btn-icon"
        style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}
        onClick={() => removeItem(item._id)}
        title="Remove item"
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  );
};

export default CartItem;
