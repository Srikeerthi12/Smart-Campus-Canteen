const LoadingSpinner = ({ size = 40, message = 'Loading...' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '60px 20px', gap: '16px',
  }}>
    <div style={{
      width: size, height: size,
      border: '3px solid rgba(255, 122, 0, 0.15)',
      borderTop: '3px solid #FF7A00',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    {message && (
      <p style={{ color: '#636e72', fontSize: '0.9rem', fontWeight: 500 }}>{message}</p>
    )}
  </div>
);

export default LoadingSpinner;
