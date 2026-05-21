import type { Metadata } from 'next'
import { applicationsApi } from '@/lib/api'

export const metadata: Metadata = { title: 'Track Application' }

interface Props { params: Promise<{ token: string }> }

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string; desc: string }> = {
  received: {
    label: 'Application Received',
    color: '#b8913a',
    icon: '📬',
    desc: 'Your application is in the queue. The employer will review it shortly.',
  },
  viewed: {
    label: 'Under Review',
    color: '#2196f3',
    icon: '👀',
    desc: "The employer has opened your application and is reviewing it.",
  },
  responded: {
    label: 'Employer Responded',
    color: '#4caf50',
    icon: '✉️',
    desc: 'The employer has responded to your application. Check your email.',
  },
  hired: {
    label: 'Congratulations!',
    color: '#4caf50',
    icon: '🎉',
    desc: "You've been selected for this role. Expect a follow-up from the employer.",
  },
}

export default async function TrackPage({ params }: Props) {
  const { token } = await params

  let data: Awaited<ReturnType<typeof applicationsApi.checkStatus>> | null = null
  let error = ''

  try {
    data = await applicationsApi.checkStatus(token)
  } catch (e) {
    error = e instanceof Error ? e.message : 'Application not found'
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--warm)', marginBottom: 24, fontStyle: 'italic' }}>
        Application status
      </p>

      {error ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 16, padding: 40 }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', color: '#e57373' }}>{error}</p>
        </div>
      ) : data ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 16, padding: '40px 32px' }}>
          {/* Status icon */}
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>
            {STATUS_CONFIG[data.status]?.icon ?? '📋'}
          </div>

          {/* Status label */}
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '1.6rem', color: STATUS_CONFIG[data.status]?.color ?? 'var(--ink)', marginBottom: 8 }}>
            {STATUS_CONFIG[data.status]?.label ?? data.status}
          </h1>

          {/* Job info */}
          <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--warm)', marginBottom: 16 }}>
            {data.jobTitle} · {data.companyName}
          </p>

          {/* Status description */}
          <p style={{ fontFamily: 'var(--serif)', fontSize: '0.95rem', color: 'var(--warm)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 24 }}>
            {STATUS_CONFIG[data.status]?.desc ?? ''}
          </p>

          {/* Employer note */}
          {data.employerNote && (
            <div style={{ background: 'var(--bg)', border: '1px dashed var(--hairline)', borderRadius: 8, padding: '16px 20px', marginBottom: 24, textAlign: 'left' }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--warm)', marginBottom: 6 }}>
                Note from employer
              </p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.6, fontStyle: 'italic' }}>
                {data.employerNote}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: 20, textAlign: 'left' }}>
            <TimelineItem label="Submitted" date={data.submittedAt} />
            {data.respondedAt && (
              <TimelineItem label="Employer responded" date={data.respondedAt} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function TimelineItem({ label, date }: { label: string; date: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--warm)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--ink)' }}>
        {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </span>
    </div>
  )
}
