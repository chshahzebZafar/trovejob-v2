'use client'
import Link from 'next/link'
import type { CompanySummary } from '@/lib/api'

interface Props { company: CompanySummary }

export default function CompanyCard({ company }: Props) {
  return (
    <Link href={`/companies/${company.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 12,
          padding: '20px 24px',
          transition: 'transform 0.15s, box-shadow 0.15s',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
        }}
        onMouseLeave={e => {
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {/* Logo */}
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logoUrl}
              alt={company.name}
              style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: 'var(--gold-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--serif)',
                fontWeight: 400,
                fontSize: '1.2rem',
                color: 'var(--gold)',
                flexShrink: 0,
              }}
            >
              {company.name[0]}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Name + verified */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h3
                style={{
                  fontFamily: 'var(--serif)',
                  fontWeight: 400,
                  fontSize: '1.05rem',
                  color: 'var(--ink)',
                }}
              >
                {company.name}
              </h3>
              {company.verified && (
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '0.62rem',
                    color: '#4caf50',
                    border: '1px solid #4caf50',
                    borderRadius: 40,
                    padding: '1px 6px',
                  }}
                >
                  ✓ verified
                </span>
              )}
            </div>

            {company.tagline && (
              <p
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: '0.88rem',
                  color: 'var(--warm)',
                  marginBottom: 10,
                  fontStyle: 'italic',
                }}
              >
                {company.tagline}
              </p>
            )}

            {/* Meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {company.hqLocation && (
                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--warm)' }}>
                  📍 {company.hqLocation}
                </span>
              )}
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--warm)' }}>
                👥 {company.size}
              </span>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.72rem',
                  color: company.responseRate >= 70 ? '#4caf50' : 'var(--warm)',
                }}
              >
                {company.responseRate}% response rate
              </span>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.72rem',
                  color: 'var(--gold)',
                }}
              >
                {company._count.jobs} open {company._count.jobs === 1 ? 'role' : 'roles'}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
