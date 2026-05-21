import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--hairline)',
        padding: '40px 24px',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <span style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--warm)' }}>
          Trove<span style={{ color: 'var(--gold)' }}>Job</span>
        </span>

        <nav style={{ display: 'flex', gap: 24 }}>
          {[
            ['/jobs',           'Browse Jobs'],
            ['/companies',      'Companies'],
            ['/employers/login','For Employers'],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.75rem',
                color: 'var(--warm)',
                textDecoration: 'none',
                letterSpacing: '0.04em',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <p
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '0.72rem',
            color: 'var(--warm)',
            opacity: 0.6,
          }}
        >
          © {new Date().getFullYear()} TroveJob. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
