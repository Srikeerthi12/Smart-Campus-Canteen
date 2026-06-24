const SkeletonCard = () => (
  <div className="clay-card" style={{ padding: '20px', overflow: 'hidden' }}>
    <div className="skeleton" style={{ height: '180px', borderRadius: '16px', marginBottom: '16px' }} />
    <div className="skeleton" style={{ height: '20px', borderRadius: '6px', marginBottom: '10px', width: '70%' }} />
    <div className="skeleton" style={{ height: '14px', borderRadius: '6px', marginBottom: '8px', width: '90%' }} />
    <div className="skeleton" style={{ height: '14px', borderRadius: '6px', marginBottom: '16px', width: '60%' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="skeleton" style={{ height: '28px', borderRadius: '20px', width: '80px' }} />
      <div className="skeleton" style={{ height: '36px', borderRadius: '12px', width: '100px' }} />
    </div>
  </div>
);

const SkeletonList = () => (
  <div style={{ padding: '20px' }}>
    {[1,2,3].map(i => (
      <div key={i} style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '16px 0',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}>
        <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: '12px', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: '16px', borderRadius: '6px', marginBottom: '8px', width: '60%' }} />
          <div className="skeleton" style={{ height: '13px', borderRadius: '6px', width: '80%' }} />
        </div>
        <div className="skeleton" style={{ height: '28px', borderRadius: '12px', width: '70px' }} />
      </div>
    ))}
  </div>
);

const SkeletonText = ({ lines = 3, widths = ['100%', '80%', '60%'] }) => (
  <div>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="skeleton" style={{
        height: '14px', borderRadius: '6px',
        marginBottom: '10px',
        width: widths[i] || '100%',
      }} />
    ))}
  </div>
);

export { SkeletonCard, SkeletonList, SkeletonText };
export default SkeletonCard;
