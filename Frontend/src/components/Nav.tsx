'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Nav() {
  const pathname = usePathname();

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
    <nav className="app-nav">
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
    </nav>
  );
}
