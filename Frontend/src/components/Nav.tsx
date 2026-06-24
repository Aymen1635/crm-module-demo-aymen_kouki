'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export function Nav() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Initialize theme from system or localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;  // ← add this
    const saved = localStorage.getItem('crm-theme') as 'light' | 'dark' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setTheme(initialTheme);
      document.documentElement.setAttribute('data-theme', initialTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('crm-theme', newTheme);
  };

  const links = [
    {
      href: '/opportunities',
      label: 'Opportunities',
      icon: '📊',
    },
    {
      href: '/opportunities/new',
      label: 'New Opportunity',
      icon: '➕',
    },
  ];

  return (
    <nav className="app-nav" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div>
        <div className="nav-logo">
          <div className="nav-logo-icon">⚡</div>
          <div>
            <div className="nav-logo-text">CRM</div>
            <div className="nav-logo-sub">Sales Pipeline</div>
          </div>
        </div>

        <div className="nav-section-label">Navigation</div>

        {links.map((link) => {
          const isActive =
            link.href === '/opportunities'
              ? pathname === '/opportunities' || pathname === '/'
              : pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-link-icon">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Theme Toggle at the bottom */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
        <button
          onClick={toggleTheme}
          className="nav-link"
          style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', outline: 'none' }}
        >
          <span className="nav-link-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </nav>
  );
}
