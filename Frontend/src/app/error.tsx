'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="fade-in">
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <div className="empty-state-icon">⚠️</div>
        <h2 className="empty-state-title">Something went wrong</h2>
        <p className="empty-state-desc">
          An unexpected error occurred. You can try again or go back to the opportunities list.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button className="btn btn-primary" onClick={reset}>
            Try again
          </button>
          <Link href="/opportunities" className="btn btn-secondary">
            ← Back to opportunities
          </Link>
        </div>
      </div>
    </div>
  );
}
