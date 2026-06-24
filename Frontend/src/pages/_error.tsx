/**
 * Minimal Pages Router _error page.
 *
 * Next.js (even in App Router mode) still pre-renders Pages Router
 * /404 and /500 during `next build` via `/_error`. This file gives
 * Next.js a valid, simple handler so it doesn't crash trying to use
 * the default one, which conflicts with our App Router setup.
 *
 * Our real 404 experience is handled by app/not-found.tsx.
 * Our real 500 experience is handled by app/global-error.tsx.
 */
import type { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

export default function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{ padding: '32px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>{statusCode || 'Client'} error</h1>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};
