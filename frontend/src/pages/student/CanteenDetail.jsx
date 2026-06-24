import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { canteenService } from '../../services/canteenService';
import { menuService } from '../../services/menuService';
import { getCanteenStatus } from '../../utils/canteenUtils';
import { formatTime } from '../../utils/formatters';
import MenuItemCard from '../../components/menu/MenuItemCard';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiMapPin, FiPhone, FiClock, FiArrowLeft } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';

const CanteenDetail = () => {
  const { id } = useParams();
  const [canteen, setCanteen] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [availFilter, setAvailFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const [c, m] = await Promise.all([
          canteenService.getById(id),
          menuService.getByCanteen(id),
        ]);
        setCanteen(c);
        setMenuItems(m);
      } catch {}
      setLoading(false);
      setMenuLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading canteen details..." />;
  if (!canteen) return (
    <EmptyState icon="🏪" title="Canteen not found" message="This canteen may have been removed." action={<Link to="/canteens" className="btn-primary">Back to Canteens</Link>} />
  );

  const { isOpen, label, className } = getCanteenStatus(canteen.openTime, canteen.closeTime);

  const filtered = menuItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchAvail = availFilter === 'all' || (availFilter === 'available' ? item.isAvailable : !item.isAvailable);
    return matchSearch && matchAvail;
  });

  return (
    <div style={{ padding: '32px 0' }}>
      <div className="container">
        {/* Back link */}
        <Link to="/canteens" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#636e72', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, marginBottom: '24px' }}>
          <FiArrowLeft size={15} /> Back to Canteens
        </Link>

        {/* Hero card */}
        <div className="clay-card" style={{
          background: isOpen
            ? 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(76,175,80,0.05))'
            : 'linear-gradient(135deg, rgba(239,68,68,0.05), rgba(248,113,113,0.03))',
          padding: '32px',
          marginBottom: '32px',
          border: `2px solid ${isOpen ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)'}`,
        }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {canteen.imageUrl ? (
              <img
                src={canteen.imageUrl}
                alt={canteen.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80';
                }}
                style={{
                  width: '80px', height: '80px', flexShrink: 0,
                  objectFit: 'cover',
                  borderRadius: '22px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                }}
              />
            ) : (
              <div style={{
                width: '80px', height: '80px', flexShrink: 0,
                background: 'linear-gradient(135deg, #FF7A00, #FFB703)',
                borderRadius: '22px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(255,122,0,0.3)',
              }}>
                <MdRestaurant size={42} color="white" />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.8rem', color: '#2D3436', margin: 0 }}>
                  {canteen.name}
                </h1>
                <span className={`badge ${className}`} style={{ fontSize: '0.82rem' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isOpen ? '#22C55E' : '#EF4444', display: 'inline-block', animation: isOpen ? 'pulse-orange 2s infinite' : 'none' }} />
                  {label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#636e72', fontSize: '0.875rem' }}>
                  <FiMapPin size={14} color="#FF7A00" />{canteen.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#636e72', fontSize: '0.875rem' }}>
                  <FiClock size={14} color="#FF7A00" />{formatTime(canteen.openTime)} – {formatTime(canteen.closeTime)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#636e72', fontSize: '0.875rem' }}>
                  <FiPhone size={14} color="#FF7A00" />{canteen.contactPhone}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#2D3436', marginBottom: '16px' }}>
            📋 Menu ({menuItems.length} items)
          </h2>
          <div style={{
            display: 'flex', gap: '12px', flexWrap: 'wrap',
            background: 'white', padding: '14px', borderRadius: '18px',
            boxShadow: 'var(--clay-shadow-sm)',
            border: '1px solid rgba(255,122,0,0.08)',
          }}>
            <input
              id="menu-search"
              type="text"
              className="input-field"
              style={{ flex: 1, minWidth: '200px' }}
              placeholder="Search menu items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {[['all', 'All'], ['available', '✅ Available'], ['unavailable', '❌ Out of Stock']].map(([val, label]) => (
              <button key={val} onClick={() => setAvailFilter(val)} style={{
                padding: '10px 16px', borderRadius: '12px', border: 'none',
                fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                background: availFilter === val ? 'linear-gradient(135deg, #FF7A00, #FFB703)' : 'rgba(255,122,0,0.06)',
                color: availFilter === val ? 'white' : '#636e72',
                transition: 'all 0.2s',
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Menu grid */}
        {menuLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="🍽️" title="No items found" message={search ? `No items match "${search}".` : 'No items in this category.'} />
        ) : (
          <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {filtered.map((item, i) => (
              <div key={item._id} className="animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                <MenuItemCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CanteenDetail;
