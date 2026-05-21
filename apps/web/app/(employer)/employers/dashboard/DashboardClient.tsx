'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { employerApi, type EmployerDashboard } from '@/lib/api'

const STATUS_COLOR: Record<string, string> = {
  received: '#b8913a',
  viewed:   '#2196f3',
  responded: '#4caf50',
  hired:    '#4caf50',
}

export default function DashboardClient() {
  const router = useRouter()
  const [data,    setData]    = useState<EmployerDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    employerApi.me()
      .then(setData)
      .catch(err => {
        if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
          router.push('/employers/login')
        } else {
          setError(err.message)
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen message={error} />
  if (!data) return null

  const { company, activeJobs, totalApplications, pendingApplications, recentApplications } = data

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logoUrl} alt={company.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: 10, background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: '1.3rem', color: 'var(--gold)' }}>
              {company.name[0]}
            </div>
          )}
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: '1.6rem', color: 'var(--ink)' }}>{company.name}</h1>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
              <PlanBadge status={company.planStatus} planName={company.plan?.name} />
            </div>
          </div>
        </div>
        <Link href="/employers/jobs/new" style={ctaStyle}>+ Post a job</Link>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard title="Active listings"     value={activeJobs}           sub={company.plan ? `of ${company.plan.maxListings === -1 ? '∞' : company.plan.maxListings} allowed` : ''} />
        <StatCard title="Total applications"  value={totalApplications}    sub="all time" />
        <StatCard title="Pending review"      value={pendingApplications}  sub="need action" accent={pendingApplications > 0} />
        <StatCard title="Response rate"       value={`${company.responseRate}%`} sub="employer accountability" accent={company.responseRate >= 70} />
        <StatCard title="Avg response time"   value={`${company.avgResponseDays.toFixed(1)}d`} sub="days to respond" />
      </div>

      {/* Recent applications */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '1.1rem', color: 'var(--ink)' }}>
            Recent applications
          </h2>
          <Link href="/employers/applications" style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--gold)', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <p style={{ fontFamily: 'var(--serif)', fontSize: '0.9rem', color: 'var(--warm)', fontStyle: 'italic' }}>
            No applications yet. Post a job to get started.
          </p>
        ) : (
          <div>
            {recentApplications.map(app => (
              <div
                key={app.id}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--hairline)' }}
              >
                <div>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: '0.95rem', color: 'var(--ink)', marginBottom: 2 }}>
                    {app.name}
                  </p>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--warm)' }}>
                    {app.jobTitle}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: STATUS_COLOR[app.status] ?? 'var(--warm)', border: `1px solid ${STATUS_COLOR[app.status] ?? 'var(--hairline)'}`, borderRadius: 40, padding: '2px 8px' }}>
                    {app.status}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--warm)' }}>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, sub, accent }: { title: string; value: number | string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${accent ? 'var(--gold)' : 'var(--hairline)'}`, borderRadius: 12, padding: '20px 20px' }}>
      <p style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--warm)', letterSpacing: '0.05em', marginBottom: 8 }}>{title.toUpperCase()}</p>
      <p style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: '2rem', color: accent ? 'var(--gold)' : 'var(--ink)', marginBottom: 4 }}>{value}</p>
      {sub && <p style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--warm)' }}>{sub}</p>}
    </div>
  )
}

function PlanBadge({ status, planName }: { status: string; planName?: string }) {
  const colors: Record<string, string> = {
    trial: '#b8913a', active: '#4caf50', suspended: '#e57373', cancelled: '#757575',
  }
  return (
    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: colors[status] ?? 'var(--warm)', border: `1px solid ${colors[status] ?? 'var(--hairline)'}`, borderRadius: 40, padding: '2px 8px' }}>
      {planName ?? 'No plan'} · {status}
    </span>
  )
}

function LoadingScreen() {
  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--warm)' }}>Loading dashboard…</p>
    </div>
  )
}
function ErrorScreen({ message }: { message: string }) {
  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: '#e57373' }}>{message}</p>
    </div>
  )
}

const ctaStyle: React.CSSProperties = {
  background: 'var(--gold)', color: 'var(--bg)', fontFamily: 'var(--mono)',
  fontSize: '0.8rem', letterSpacing: '0.05em', padding: '10px 22px',
  borderRadius: 40, textDecoration: 'none',
}
