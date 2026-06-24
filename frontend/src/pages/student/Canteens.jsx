import { useState, useEffect } from 'react';
import { canteenService } from '../../services/canteenService';
import CanteenCard from '../../components/canteen/CanteenCard';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { getCanteenStatus } from '../../utils/canteenUtils';
import { FiSearch, FiFilter } from 'react-icons/fi';

const Canteens = () => {
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'open' | 'closed'

  useEffect(() => {
    canteenService.getAll()
      .then(setCanteens)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = canteens.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    const { isOpen } = getCanteenStatus(c.openTime, c.closeTime);
    const matchFilter = filter === 'all' || (filter === 'open' ? isOpen : !isOpen);
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2rem', color: '#2D3436', marginBottom: '8px' }}>
            🏪 Campus Canteens
          </h1>
          <p style={{ color: '#636e72', fontSize: '0.95rem' }}>
            {canteens.length} canteen{canteens.length !== 1 ? 's' : ''} on campus · {canteens.filter(c => getCanteenStatus(c.openTime, c.closeTime).isOpen).length} open now
          </p>
        </div>

        {/* Search & Filters */}
        <div style={{
          display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap',
          background: 'white', padding: '16px', borderRadius: '20px',
          boxShadow: 'var(--clay-shadow-sm)',
          border: '1px solid rgba(255,122,0,0.08)',
        }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <FiSearch size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#b2bec3' }} />
            <input
              id="canteen-search"
              type="text"
              className="input-field"
              style={{ paddingLeft: '44px' }}
              placeholder="Search canteens by name or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[['all', 'All'], ['open', '🟢 Open'], ['closed', '🔴 Closed']].map(([val, label]) => (
              <button
                key={val}
                id={`filter-${val}`}
                onClick={() => setFilter(val)}
                style={{
                  padding: '10px 18px', borderRadius: '12px', border: 'none',
                  fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  background: filter === val ? 'linear-gradient(135deg, #FF7A00, #FFB703)' : 'rgba(255,122,0,0.06)',
                  color: filter === val ? 'white' : '#636e72',
                  transition: 'all 0.2s',
                  boxShadow: filter === val ? '0 4px 14px rgba(255,122,0,0.3)' : 'none',
                }}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🏪"
            title="No canteens found"
            message={search ? `No results for "${search}". Try a different search.` : 'No canteens match your filter.'}
            action={<button className="btn-secondary" onClick={() => { setSearch(''); setFilter('all'); }}>Clear Filters</button>}
          />
        ) : (
          <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {filtered.map((canteen, i) => (
              <div key={canteen._id} className="animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                <CanteenCard canteen={canteen} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Canteens;
