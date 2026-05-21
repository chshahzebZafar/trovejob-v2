'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const isEmployer = pathname?.startsWith('/employers')
  const isAdmin    = pathname?.startsWith('/admin')

  if (isAdmin) return null   // admin has its own layout

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--hairline)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span
            style={{
              fontFamily: 'var(--serif)',
              fontWeight: 300,
              fontSize: '1.25rem',
              color: 'var(--ink)',
              letterSpacing: '0.04em',
            }}
          >
            Trove<span style={{ color: 'var(--gold)' }}>Job</span>
          </span>
        </Link>

        {/* Nav links */}
        {!isEmployer ? (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <NavLink href="/jobs" label="Browse Jobs" active={pathname === '/jobs'} />
            <NavLink href="/companies" label="Companies" active={pathname === '/companies'} />
            <Link
              href="/employers/login"
              style={{
                fontSize: '0.8rem',
                fontFamily: 'var(--mono)',
                color: 'var(--gold)',
                textDecoration: 'none',
                border: '1px solid var(--gold)',
                padding: '6px 16px',
                borderRadius: 40,
                letterSpacing: '0.05em',
                transition: 'all 0.2s',
              }}
            >
              For Employers
            </Link>
          </nav>
        ) : (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <NavLink href="/employers/dashboard" label="Dashboard"    active={pathname === '/employers/dashboard'} />
            <NavLink href="/employers/jobs"       label="Listings"    active={pathname?.startsWith('/employers/jobs') ?? false} />
            <NavLink href="/employers/applications" label="Inbox"     active={pathname === '/employers/applications'} />
            <NavLink href="/employers/profile"    label="Profile"     active={pathname === '/employers/profile'} />
          </nav>
        )}
      </div>
    </header>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        fontSize: '0.85rem',
        fontFamily: 'var(--mono)',
        color: active ? 'var(--gold)' : 'var(--warm)',
        textDecoration: 'none',
        letterSpacing: '0.04em',
        transition: 'color 0.2s',
        borderBottom: active ? '1px solid var(--gold)' : '1px solid transparent',
        paddingBottom: 2,
      }}
    >
      {label}
    </Link>
  )
}
