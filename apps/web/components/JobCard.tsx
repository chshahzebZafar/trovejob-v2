import Link from 'next/link'
import type { JobSummary } from '@/lib/api'

interface Props { job: JobSummary }

const LOC_LABEL: Record<string, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
}

const EMP_LABEL: Record<string, string> = {
  fulltime: 'Full-time',
  parttime: 'Part-time',
  contract: 'Contract',
}

export default function JobCard({ job }: Props) {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(job.deadline).getTime() - Date.now()) / 86_400_000),
  )

  return (
    <Link href={`/jobs/${job.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article
        style={{
          background: 'var(--surface)',
          border: `1px solid ${job.featured ? 'var(--gold)' : 'var(--hairline)'}`,
          borderRadius: 12,
          padding: '20px 24px',
          transition: 'transform 0.15s, box-shadow 0.15s',
          cursor: 'pointer',
          position: 'relative',
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
        {job.featured && (
          <span
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontFamily: 'var(--mono)',
              fontSize: '0.65rem',
              color: 'var(--gold)',
              border: '1px solid var(--gold)',
              borderRadius: 40,
              padding: '2px 8px',
              letterSpacing: '0.06em',
            }}
          >
            FEATURED
          </span>
        )}

        {/* Company row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          {job.company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.company.logoUrl}
              alt={job.company.name}
              style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: 'var(--gold-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--serif)',
                fontWeight: 400,
                fontSize: '0.85rem',
                color: 'var(--gold)',
              }}
            >
              {job.company.name[0]}
            </div>
          )}
          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--warm)' }}>
            {job.company.name}
          </span>
          {job.company.verified && (
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.65rem',
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

        {/* Title */}
        <h3
          style={{
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: '1.15rem',
            color: 'var(--ink)',
            marginBottom: 12,
            lineHeight: 1.3,
          }}
        >
          {job.title}
        </h3>

        {/* Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <Badge>{LOC_LABEL[job.locationType] ?? job.locationType}</Badge>
          {job.city && <Badge>{job.city}</Badge>}
          <Badge>{EMP_LABEL[job.employmentType] ?? job.employmentType}</Badge>
          <Badge>
            {formatSalary(job.salaryMin, job.currency)} – {formatSalary(job.salaryMax, job.currency)}
          </Badge>
        </div>

        {/* Footer row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 4,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.72rem',
              color: job.company.responseRate >= 70 ? '#4caf50' : 'var(--warm)',
            }}
          >
            {job.company.responseRate}% response rate
          </span>
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.72rem',
              color: daysLeft <= 3 ? '#e57373' : 'var(--warm)',
            }}
          >
            {daysLeft === 0 ? 'Closes today' : `${daysLeft}d left`}
          </span>
        </div>
      </article>
    </Link>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: 'var(--mono)',
        fontSize: '0.72rem',
        color: 'var(--warm)',
        background: 'var(--bg)',
        border: '1px solid var(--hairline)',
        borderRadius: 40,
        padding: '3px 10px',
        letterSpacing: '0.03em',
      }}
    >
      {children}
    </span>
  )
}

function formatSalary(amount: number, currency: string) {
  if (amount >= 1000) return `${currency === 'USD' ? '$' : currency}${Math.round(amount / 1000)}k`
  return `${currency === 'USD' ? '$' : currency}${amount}`
}
