const EmptyState = ({ icon = '🍽️', title = 'Nothing here yet', message = '', action }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '80px 20px', textAlign: 'center',
  }}>
    <div style={{
      fontSize: '4rem', marginBottom: '20px',
      animation: 'float 3s ease-in-out infinite',
    }}>
      {icon}
    </div>
    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: '#2D3436', marginBottom: '8px' }}>
      {title}
    </h3>
    {message && (
      <p style={{ color: '#636e72', fontSize: '0.95rem', maxWidth: '400px', lineHeight: '1.6', marginBottom: '24px' }}>
        {message}
      </p>
    )}
    {action && action}
  </div>
);

export default EmptyState;
