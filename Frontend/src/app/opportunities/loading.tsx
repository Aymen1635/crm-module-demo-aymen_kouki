export default function Loading() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="skeleton" style={{ width: '200px', height: '32px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '150px', height: '20px' }} />
        </div>
        <div className="skeleton" style={{ width: '140px', height: '40px', borderRadius: 'var(--radius-md)' }} />
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="skeleton" style={{ width: '120px', height: '24px' }} />
        </div>
        <div style={{ padding: 'var(--space-6)' }}>
          <div className="skeleton" style={{ width: '100%', height: '80px', marginBottom: '16px' }} />
          <div className="skeleton" style={{ width: '100%', height: '40px' }} />
        </div>
      </div>

      <div className="filters-bar">
        <div className="skeleton" style={{ width: '100px', height: '36px', borderRadius: 'var(--radius-md)' }} />
        <div className="skeleton" style={{ width: '150px', height: '36px', borderRadius: 'var(--radius-md)' }} />
        <div className="skeleton" style={{ width: '150px', height: '36px', borderRadius: 'var(--radius-md)' }} />
      </div>

      <div className="table-wrapper">
        <div style={{ padding: 'var(--space-4)' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ width: '100%', height: '48px', marginBottom: '8px' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
