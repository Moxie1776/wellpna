const HomePage = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
    }}
  >
    <div
      style={{
        width: '100%',
        maxWidth: '28rem',
        padding: '1.5rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.75rem',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>WellPNA</h1>
      </div>
      <div style={{ padding: '1.5rem', paddingTop: 0 }}>
        <p
          style={{
            textAlign: 'center',
            color: '#6b7280',
            marginBottom: '1rem',
          }}
        >
          Welcome to WellPNA
        </p>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <a
            href='/login'
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
            }}
          >
            Sign In
          </a>
          <a
            href='/signup'
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              color: '#374151',
              textDecoration: 'none',
            }}
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default HomePage;
