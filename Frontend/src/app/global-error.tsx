'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service in production
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '32px',
            fontFamily: 'system-ui, sans-serif',
            background: '#0d0f14',
            color: '#f1f5f9',
            textAlign: 'center',
            gap: '16px',
          }}
        >
          <div style={{ fontSize: '40px' }}>⚠️</div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
            Something went wrong
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, maxWidth: '360px' }}>
            An unexpected error occurred. You can try again or go back to the homepage.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={reset}
              style={{
                padding: '8px 20px',
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '14px',
              }}
            >
              Try again
            </button>
            <Link
              href="/opportunities"
              style={{
                padding: '8px 20px',
                background: 'transparent',
                color: '#94a3b8',
                border: '1px solid #334155',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              Back to home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
