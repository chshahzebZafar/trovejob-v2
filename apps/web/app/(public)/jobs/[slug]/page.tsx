import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { jobsApi } from '@/lib/api'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const { job } = await jobsApi.get(slug)
    return { title: `${job.title} at ${job.company.name}` }
  } catch {
    return { title: 'Job Not Found' }
  }
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params

  let job
  try {
    const res = await jobsApi.get(slug)
    job = res.job
  } catch {
    notFound()
  }

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(job.deadline).getTime() - Date.now()) / 86_400_000),
  )

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px' }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: 24 }}>
        <Link href="/jobs" style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--warm)', textDecoration: 'none' }}>
          ← Back to Jobs
        </Link>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
        {/* Main content */}
        <div>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              {job.company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={job.company.logoUrl} alt={job.company.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--gold)' }}>
                  {job.company.name[0]}
                </div>
              )}
              <div>
                <Link href={`/companies/${job.company.slug}`} style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem', color: 'var(--gold)', textDecoration: 'none' }}>
                  {job.company.name}
                </Link>
                {job.company.verified && (
                  <span style={{ marginLeft: 8, fontFamily: 'var(--mono)', fontSize: '0.62rem', color: '#4caf50', border: '1px solid #4caf50', borderRadius: 40, padding: '1px 6px' }}>✓ verified</span>
                )}
              </div>
            </div>

            <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'var(--ink)', marginBottom: 16, lineHeight: 1.2 }}>
              {job.title}
            </h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                job.locationType.charAt(0).toUpperCase() + job.locationType.slice(1),
                job.city,
                job.employmentType === 'fulltime' ? 'Full-time' : job.employmentType === 'parttime' ? 'Part-time' : 'Contract',
                `${job.currency === 'USD' ? '$' : job.currency}${Math.round(job.salaryMin / 1000)}k–${Math.round(job.salaryMax / 1000)}k`,
              ].filter(Boolean).map((b, i) => (
                <span key={i} style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--warm)', background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 40, padding: '4px 12px' }}>
                  {b}
                </span>
              ))}
              {job.featured && (
                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: 40, padding: '4px 12px' }}>
                  Featured
                </span>
              )}
            </div>
          </div>

          {/* Craft description */}
          {job.craftDescription && (
            <Section title="Why this role">
              <p style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--ink)', fontStyle: 'italic', lineHeight: 1.7 }}>
                {job.craftDescription}
              </p>
            </Section>
          )}

          <Section title="About the role">
            <Prose content={job.description} />
          </Section>

          <Section title="Requirements">
            <Prose content={job.requirements} />
          </Section>

          <Section title="Benefits">
            <Prose content={job.benefits} />
          </Section>
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 80 }}>
          {/* Apply card */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, padding: 24, marginBottom: 16 }}>
            <Link
              href={`/apply/${job.slug}`}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'center',
                background: 'var(--gold)',
                color: 'var(--bg)',
                fontFamily: 'var(--mono)',
                fontSize: '0.88rem',
                letterSpacing: '0.06em',
                padding: '14px 0',
                borderRadius: 40,
                textDecoration: 'none',
                marginBottom: 12,
              }}
            >
              Apply now — no account needed
            </Link>

            <p style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--warm)', textAlign: 'center' }}>
              {daysLeft === 0 ? '⚠️ Closes today' : daysLeft <= 3 ? `⚠️ Only ${daysLeft} days left` : `${daysLeft} days left to apply`}
            </p>
          </div>

          {/* Company stats */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '1rem', color: 'var(--ink)', marginBottom: 16 }}>
              About {job.company.name}
            </h3>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '0.88rem', color: 'var(--warm)', lineHeight: 1.6, marginBottom: 16, fontStyle: 'italic' }}>
              {job.company.tagline}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Stat label="Response rate"    value={`${job.company.responseRate}%`} highlight={job.company.responseRate >= 70} />
              <Stat label="Avg response"     value={`${job.company.avgResponseDays.toFixed(1)} days`} />
              <Stat label="Total hired from" value={`${job.company.totalApplications} applicants`} />
              <Stat label="Company size"     value={job.company.size} />
              {job.company.hqLocation && <Stat label="HQ" value={job.company.hqLocation} />}
            </div>
            <Link href={`/companies/${job.company.slug}`} style={{ display: 'block', marginTop: 16, fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--gold)', textDecoration: 'none' }}>
              View company profile →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '1.15rem', color: 'var(--ink)', borderBottom: '1px solid var(--hairline)', paddingBottom: 8, marginBottom: 16 }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function Prose({ content }: { content: string }) {
  return (
    <div style={{ fontFamily: 'var(--serif)', fontSize: '0.95rem', color: 'var(--ink)', lineHeight: 1.75 }}>
      {content.split('\n').map((line, i) => (
        line.trim() === ''
          ? <br key={i} />
          : <p key={i} style={{ marginBottom: 8 }}>{line}</p>
      ))}
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--warm)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: highlight ? '#4caf50' : 'var(--ink)' }}>{value}</span>
    </div>
  )
}
