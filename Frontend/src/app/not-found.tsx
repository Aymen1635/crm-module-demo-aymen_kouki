import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="fade-in">
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <div className="empty-state-icon">🔍</div>
        <h1 className="empty-state-title">Page not found</h1>
        <p className="empty-state-desc">
          The opportunity you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Link href="/opportunities" className="btn btn-primary" style={{ marginTop: '16px' }}>
          ← Back to opportunities
        </Link>
      </div>
    </div>
  );
}
