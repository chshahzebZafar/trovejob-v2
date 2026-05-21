'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'

const LINKS = [
  { href: '/admin/dashboard',          label: 'Dashboard',    icon: '◈' },
  { href: '/admin/employer-requests',  label: 'Requests',     icon: '📋' },
  { href: '/admin/employers',          label: 'Employers',    icon: '🏢' },
  { href: '/admin/listings',           label: 'Listings',     icon: '📌' },
  { href: '/admin/plans',              label: 'Plans',        icon: '💎' },
  { href: '/admin/analytics',          label: 'Analytics',    icon: '📊' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  // Don't render sidebar on admin login page
  if (pathname === '/admin/login') return null

  return (
    <aside
      style={{
        width: 220,
        minHeight: '100vh',
        background: 'var(--surface)',
        borderRight: '1px solid var(--hairline)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 20px 28px', borderBottom: '1px solid var(--hairline)', marginBottom: 16 }}>
        <span style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: '1.1rem', color: 'var(--ink)', letterSpacing: '0.04em' }}>
          Trove<span style={{ color: 'var(--gold)' }}>Job</span>
        </span>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.62rem', color: 'var(--warm)', marginTop: 2 }}>
          Admin
        </p>
      </div>

      <nav style={{ flex: 1, padding: '0 12px' }}>
        {LINKS.map(({ href, label, icon }) => {
          const active = pathname === href || pathname?.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: 2,
                textDecoration: 'none',
                background: active ? 'var(--gold-dim)' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: '0.9rem' }}>{icon}</span>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.78rem',
                  color: active ? 'var(--gold)' : 'var(--warm)',
                  letterSpacing: '0.03em',
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--hairline)' }}>
        <button
          onClick={async () => {
            await adminApi.logout().catch(() => {})
            router.push('/admin/login')
          }}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontFamily: 'var(--mono)',
            fontSize: '0.7rem',
            color: 'var(--warm)',
            cursor: 'pointer',
            letterSpacing: '0.03em',
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
