import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { formatCurrency, truncate } from '../../utils/formatters';
import { FiPlus, FiMinus, FiShoppingCart } from 'react-icons/fi';

const FOOD_PLACEHOLDER = (name) => {
  const colors = ['#FF7A00','#FFB703','#4CAF50','#2196F3','#9C27B0'];
  const color = colors[name.charCodeAt(0) % colors.length];
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return { color, initials };
};

const MenuItemCard = ({ item }) => {
  const { addItem, removeItem, updateQuantity, isInCart, getItemQuantity } = useCart();
  const [imageError, setImageError] = useState(false);
  const [adding, setAdding] = useState(false);

  const inCart = isInCart(item._id);
  const quantity = getItemQuantity(item._id);
  const placeholder = FOOD_PLACEHOLDER(item.name);

  const handleAdd = async () => {
    setAdding(true);
    addItem(item);
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <div
      className="clay-card-sm"
      style={{
        overflow: 'hidden',
        opacity: item.isAvailable ? 1 : 0.65,
        transition: 'all 0.3s',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: '150px', overflow: 'hidden' }}>
        {item.imageUrl && !imageError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            onError={() => setImageError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: `linear-gradient(135deg, ${placeholder.color}22, ${placeholder.color}44)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontSize: '2.2rem', fontWeight: 800,
              color: placeholder.color, fontFamily: 'Outfit, sans-serif',
              opacity: 0.7,
            }}>{placeholder.initials}</span>
          </div>
        )}

        {/* Unavailable overlay */}
        {!item.isAvailable && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              background: '#EF4444', color: 'white',
              padding: '4px 14px', borderRadius: '20px',
              fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em',
            }}>
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px' }}>
        <h4 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#2D3436', marginBottom: '4px' }}>
          {item.name}
        </h4>
        <p style={{ color: '#636e72', fontSize: '0.8rem', marginBottom: '12px', lineHeight: '1.5' }}>
          {truncate(item.description, 60)}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#FF7A00' }}>
            {formatCurrency(item.price)}
          </span>

          {/* Cart controls */}
          {item.isAvailable && (
            !inCart ? (
              <button
                id={`add-to-cart-${item._id}`}
                onClick={handleAdd}
                className="btn-primary"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  borderRadius: '10px',
                  transform: adding ? 'scale(0.95)' : 'scale(1)',
                }}
              >
                <FiShoppingCart size={14} />
                {adding ? 'Added!' : 'Add'}
              </button>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,122,0,0.08)',
                borderRadius: '10px', padding: '4px',
              }}>
                <button
                  className="btn-icon"
                  style={{ width: '30px', height: '30px', borderRadius: '8px' }}
                  onClick={() => updateQuantity(item._id, quantity - 1)}
                >
                  <FiMinus size={14} />
                </button>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', minWidth: '20px', textAlign: 'center', color: '#FF7A00' }}>
                  {quantity}
                </span>
                <button
                  className="btn-icon"
                  style={{ width: '30px', height: '30px', borderRadius: '8px' }}
                  onClick={() => addItem(item)}
                >
                  <FiPlus size={14} />
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
