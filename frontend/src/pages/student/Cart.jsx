import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/orderService';
import CartItem from '../../components/cart/CartItem';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiShoppingBag, FiFileText } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';
import { isCanteenOpen } from '../../utils/canteenUtils';

const Cart = () => {
  const { cartItems, clearCart, getTotalItems, getTotalPrice } = useCart();
  const [instructions, setInstructions] = useState('');
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    // 1. Check if any canteen is closed
    const closedCanteens = new Set();
    cartItems.forEach(item => {
      const canteen = typeof item.canteen === 'object' ? item.canteen : null;
      if (canteen && !isCanteenOpen(canteen.openTime, canteen.closeTime)) {
        closedCanteens.add(canteen.name || 'Canteen');
      }
    });

    if (closedCanteens.size > 0) {
      const names = Array.from(closedCanteens).join(', ');
      toast.error(`🏪 Canteen "${names}" is closed. Please remove its items to place order.`);
      return;
    }

    setPlacing(true);
    try {
      // 2. Group items by canteen ID
      const itemsByCanteen = {};
      cartItems.forEach(item => {
        const cId = item.canteen?._id || item.canteen;
        if (!cId) return;
        if (!itemsByCanteen[cId]) {
          itemsByCanteen[cId] = [];
        }
        itemsByCanteen[cId].push(item);
      });

      const canteenIds = Object.keys(itemsByCanteen);

      // 3. Place separate orders per canteen
      for (const cId of canteenIds) {
        const itemsForCanteen = itemsByCanteen[cId];
        const canteenTotal = itemsForCanteen.reduce((sum, i) => sum + i.price * i.quantity, 0);

        const orderData = {
          items: itemsForCanteen.map(i => i._id),
          quantities: itemsForCanteen.map(i => i.quantity),
          total: canteenTotal,
          canteenId: cId,
          specialInstructions: instructions,
        };
        await orderService.create(orderData);
      }

      clearCart();
      const orderCount = canteenIds.length;
      toast.success(orderCount > 1
        ? `🎉 Placed ${orderCount} orders successfully (split by canteen)!`
        : '🎉 Order placed successfully!'
      );
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: '40px 0' }}>
        <div className="container">
          <EmptyState
            icon="🛒"
            title="Your cart is empty"
            message="Add delicious items from any campus canteen to get started."
            action={<Link to="/canteens" className="btn-primary">Browse Canteens</Link>}
          />
        </div>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const tax = subtotal * 0; // no tax — just showing structure
  const total = subtotal + tax;

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <Link to="/canteens" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#636e72', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, marginBottom: '24px' }}>
          <FiArrowLeft size={15} /> Continue Shopping
        </Link>

        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2rem', color: '#2D3436', marginBottom: '8px' }}>
          🛒 Your Cart
        </h1>
        <p style={{ color: '#636e72', fontSize: '0.9rem', marginBottom: '32px' }}>
          {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} ready to order
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>
          {/* Items */}
          <div className="clay-card" style={{ padding: '24px' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#2D3436', marginBottom: '4px' }}>
              Order Items
            </h2>
            <div>
              {cartItems.map(item => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>

            {/* Special instructions */}
            <div style={{ marginTop: '24px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiFileText size={14} /> Special Instructions (optional)
              </label>
              <textarea
                id="special-instructions"
                className="input-field"
                style={{ minHeight: '90px', resize: 'vertical' }}
                placeholder="Any allergies, special requests, or notes for the canteen..."
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
              />
            </div>
          </div>

          {/* Summary */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div className="clay-card" style={{ padding: '28px' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#2D3436', marginBottom: '20px' }}>
                Order Summary
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {cartItems.map(item => (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#636e72' }}>
                      {item.name} × {item.quantity}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2D3436' }}>
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1.5px dashed rgba(0,0,0,0.1)', paddingTop: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: '#2D3436' }}>Total</span>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.4rem', color: '#FF7A00' }}>
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <button
                id="place-order-btn"
                onClick={handlePlaceOrder}
                className="btn-primary"
                disabled={placing}
                style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1rem' }}
              >
                {placing ? (
                  <>
                    <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Placing Order...
                  </>
                ) : (
                  <><FiShoppingBag size={18} /> Place Order</>
                )}
              </button>

              <button
                onClick={() => { if (window.confirm('Clear your entire cart?')) clearCart(); }}
                style={{
                  width: '100%', marginTop: '10px',
                  padding: '12px', borderRadius: '12px',
                  border: 'none', background: 'rgba(239,68,68,0.06)',
                  color: '#EF4444', fontWeight: 600, cursor: 'pointer',
                  fontSize: '0.875rem', transition: 'all 0.2s',
                }}
              >
                Clear Cart
              </button>
            </div>

            <div className="clay-card-sm" style={{ padding: '16px', marginTop: '16px', background: 'rgba(255,122,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#636e72' }}>
                <MdRestaurant size={18} color="#FF7A00" />
                <span>Your order will be prepared by the canteen staff. Pick up when ready!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
