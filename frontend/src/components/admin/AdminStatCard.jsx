const AdminStatCard = ({ icon, title, value, color = '#FF7A00', bgGradient, subtitle }) => {
  return (
    <div
      className="clay-card"
      style={{
        padding: '24px',
        background: bgGradient || 'white',
        position: 'relative', overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Decorative circle */}
      <div style={{
        position: 'absolute', right: '-20px', top: '-20px',
        width: '100px', height: '100px',
        borderRadius: '50%',
        background: `${color}18`,
      }} />

      <div style={{
        width: '48px', height: '48px',
        background: `${color}18`,
        borderRadius: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '16px',
      }}>
        <span style={{ color, fontSize: '1.4rem' }}>{icon}</span>
      </div>

      <div style={{ fontSize: '0.82rem', color: '#636e72', fontWeight: 500, marginBottom: '6px' }}>
        {title}
      </div>

      <div style={{
        fontFamily: 'Outfit, sans-serif',
        fontSize: '2rem', fontWeight: 800,
        color: '#2D3436', lineHeight: 1,
        marginBottom: '6px',
      }}>
        {value}
      </div>

      {subtitle && (
        <div style={{ fontSize: '0.78rem', color: '#636e72' }}>{subtitle}</div>
      )}
    </div>
  );
};

export default AdminStatCard;
