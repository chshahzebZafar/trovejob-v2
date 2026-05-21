import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { companiesApi } from '@/lib/api'
import JobCard from '@/components/JobCard'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const { company } = await companiesApi.get(slug)
    return { title: company.name, description: company.tagline }
  } catch {
    return { title: 'Company Not Found' }
  }
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params
  let company: Awaited<ReturnType<typeof companiesApi.get>>['company']

  try {
    const res = await companiesApi.get(slug)
    company = res.company
  } catch {
    notFound()
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px' }}>
      <nav style={{ marginBottom: 28 }}>
        <Link href="/companies" style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--warm)', textDecoration: 'none' }}>
          ← All Companies
        </Link>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 40, alignItems: 'start' }}>
        {/* Main */}
        <div>
          {/* Hero */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 32 }}>
            {company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoUrl} alt={company.name} style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: 12, background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: '1.8rem', color: 'var(--gold)', flexShrink: 0 }}>
                {company.name[0]}
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'var(--ink)' }}>
                  {company.name}
                </h1>
                {company.verified && (
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: '#4caf50', border: '1px solid #4caf50', borderRadius: 40, padding: '2px 8px' }}>
                    ✓ verified
                  </span>
                )}
              </div>
              {company.tagline && (
                <p style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--warm)', fontStyle: 'italic', marginBottom: 12 }}>
                  {company.tagline}
                </p>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {company.hqLocation && <Meta>📍 {company.hqLocation}</Meta>}
                <Meta>👥 {company.size}</Meta>
                {company.founded && <Meta>🗓 Est. {company.founded}</Meta>}
                <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--gold)', textDecoration: 'none' }}>
                  🌐 Website ↗
                </a>
              </div>
            </div>
          </div>

          {/* About */}
          {company.craftStatement && (
            <div style={{ marginBottom: 28 }}>
              <blockquote style={{ borderLeft: '2px solid var(--gold)', paddingLeft: 16, fontFamily: 'var(--serif)', fontSize: '1.05rem', color: 'var(--ink)', fontStyle: 'italic', lineHeight: 1.7 }}>
                {company.craftStatement}
              </blockquote>
            </div>
          )}

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '1.1rem', color: 'var(--ink)', borderBottom: '1px solid var(--hairline)', paddingBottom: 8, marginBottom: 14 }}>
              About
            </h2>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '0.95rem', color: 'var(--ink)', lineHeight: 1.75 }}>
              {company.description}
            </p>
          </div>

          {/* Team photos */}
          {company.teamPhotos.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '1.1rem', color: 'var(--ink)', borderBottom: '1px solid var(--hairline)', paddingBottom: 8, marginBottom: 14 }}>
                Team
              </h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {company.teamPhotos.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={url} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} />
                ))}
              </div>
            </div>
          )}

          {/* Open roles */}
          <div>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '1.1rem', color: 'var(--ink)', borderBottom: '1px solid var(--hairline)', paddingBottom: 8, marginBottom: 14 }}>
              Open roles ({company.jobs.length})
            </h2>
            {company.jobs.length === 0 ? (
              <p style={{ fontFamily: 'var(--serif)', fontSize: '0.9rem', color: 'var(--warm)', fontStyle: 'italic' }}>
                No open roles right now — follow for updates.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {company.jobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '1rem', color: 'var(--ink)', marginBottom: 16 }}>
              Employer accountability
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Stat label="Response rate"    value={`${company.responseRate}%`}         highlight={company.responseRate >= 70} />
              <Stat label="Avg response"     value={`${company.avgResponseDays.toFixed(1)} days`} />
              <Stat label="Total applicants" value={`${company.totalApplications}`} />
              <Stat label="Company size"     value={company.size} />
            </div>
            {company.socialLinks && Object.keys(company.socialLinks).length > 0 && (
              <div style={{ marginTop: 16, borderTop: '1px solid var(--hairline)', paddingTop: 16 }}>
                {Object.entries(company.socialLinks).map(([k, v]) => (
                  <a
                    key={k}
                    href={String(v)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--gold)', textDecoration: 'none', marginBottom: 6 }}
                  >
                    {k.charAt(0).toUpperCase() + k.slice(1)} ↗
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Meta({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--warm)' }}>{children}</span>
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--warm)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: highlight ? '#4caf50' : 'var(--ink)' }}>{value}</span>
    </div>
  )
}
