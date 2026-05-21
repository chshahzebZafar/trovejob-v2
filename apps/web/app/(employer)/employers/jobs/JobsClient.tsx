'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { employerApi, type EmployerJob } from '@/lib/api'

const STATUS_COLOR: Record<string, string> = {
  draft: '#757575', active: '#4caf50', filled: '#2196f3', paused: '#b8913a',
}

export default function JobsClient() {
  const router = useRouter()
  const [jobs,    setJobs]    = useState<EmployerJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    employerApi.jobs()
      .then(r => setJobs(r.jobs))
      .catch(err => {
        if (err.message?.includes('401')) router.push('/employers/login')
        else setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [router])

  async function changeStatus(id: string, status: string) {
    try {
      await employerApi.updateJobStatus(id, status)
      setJobs(jobs => jobs.map(j => j.id === id ? { ...j, status } : j))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: '1.8rem', color: 'var(--ink)' }}>
          My listings
        </h1>
        <Link href="/employers/jobs/new" style={ctaStyle}>+ Post a job</Link>
      </div>

      {loading ? (
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--warm)' }}>Loading…</p>
      ) : error ? (
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: '#e57373' }}>{error}</p>
      ) : jobs.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, padding: '60px 32px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--warm)', fontStyle: 'italic', marginBottom: 20 }}>
            You haven&apos;t posted any jobs yet.
          </p>
          <Link href="/employers/jobs/new" style={ctaStyle}>Post your first role →</Link>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 100px 80px 120px', gap: 16, padding: '12px 24px', borderBottom: '1px solid var(--hairline)', background: 'var(--bg)' }}>
            {['Role', 'Type', 'Location', 'Apps', 'Deadline', 'Status'].map(h => (
              <span key={h} style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--warm)', letterSpacing: '0.06em' }}>{h.toUpperCase()}</span>
            ))}
          </div>
          {jobs.map((job, i) => (
            <div
              key={job.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 120px 100px 80px 120px',
                gap: 16,
                padding: '16px 24px',
                borderBottom: i < jobs.length - 1 ? '1px solid var(--hairline)' : 'none',
                alignItems: 'center',
              }}
            >
              <div>
                <Link href={`/jobs/${job.slug}`} style={{ fontFamily: 'var(--serif)', fontSize: '0.95rem', color: 'var(--ink)', textDecoration: 'none' }}>
                  {job.title}
                </Link>
                <p style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--warm)', marginTop: 2 }}>
                  {job._count.applications} applicant{job._count.applications !== 1 ? 's' : ''}
                </p>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--warm)' }}>
                {job.employmentType === 'fulltime' ? 'Full-time' : job.employmentType === 'parttime' ? 'Part-time' : 'Contract'}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--warm)' }}>
                {job.locationType.charAt(0).toUpperCase() + job.locationType.slice(1)}
              </span>
              <Link href={`/employers/applications?jobId=${job.id}`} style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--gold)', textDecoration: 'none' }}>
                {job._count.applications} →
              </Link>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--warm)' }}>
                {new Date(job.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
              <select
                value={job.status}
                onChange={e => changeStatus(job.id, e.target.value)}
                style={{
                  fontFamily: 'var(--mono)', fontSize: '0.72rem',
                  color: STATUS_COLOR[job.status] ?? 'var(--warm)',
                  background: 'var(--bg)', border: '1px solid var(--hairline)',
                  borderRadius: 40, padding: '4px 10px', cursor: 'pointer',
                }}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="filled">Filled</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const ctaStyle: React.CSSProperties = {
  background: 'var(--gold)', color: 'var(--bg)', fontFamily: 'var(--mono)',
  fontSize: '0.8rem', letterSpacing: '0.05em', padding: '10px 22px',
  borderRadius: 40, textDecoration: 'none',
}
