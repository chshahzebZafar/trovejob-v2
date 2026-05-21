'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { employerApi, type EmployerApplication } from '@/lib/api'
import { Suspense } from 'react'

const STATUS_COLOR: Record<string, string> = {
  received: '#b8913a', viewed: '#2196f3', responded: '#4caf50', hired: '#9c27b0',
}

function ApplicationsInner() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const jobId        = searchParams.get('jobId') ?? undefined

  const [apps,      setApps]      = useState<EmployerApplication[]>([])
  const [selected,  setSelected]  = useState<(EmployerApplication & { cvSignedUrl: string }) | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [responding,setResponding]= useState(false)
  const [error,     setError]     = useState('')
  const [note,      setNote]      = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await employerApi.applications({ jobId, status: statusFilter || undefined })
      setApps(res.applications)
    } catch (err) {
      if ((err as Error).message?.includes('401')) router.push('/employers/login')
      else setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [jobId, statusFilter, router])

  useEffect(() => { load() }, [load])

  async function openApp(id: string) {
    const res = await employerApi.getApplication(id)
    setSelected(res.application)
    setNote('')
    // Mark as viewed optimistically
    setApps(apps => apps.map(a => a.id === id && a.status === 'received' ? { ...a, status: 'viewed' } : a))
  }

  async function respond(action: 'forward' | 'reject' | 'keep') {
    if (!selected) return
    setResponding(true)
    try {
      await employerApi.respondToApplication(selected.id, { action, note })
      await load()
      setSelected(null)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setResponding(false)
    }
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: '1.8rem', color: 'var(--ink)' }}>
          Applications inbox
        </h1>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="">All statuses</option>
          <option value="received">Received</option>
          <option value="viewed">Viewed</option>
          <option value="responded">Responded</option>
        </select>
      </div>

      {loading ? (
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--warm)' }}>Loading…</p>
      ) : error ? (
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: '#e57373' }}>{error}</p>
      ) : apps.length === 0 ? (
        <p style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--warm)', fontStyle: 'italic' }}>
          No applications match your filter.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 20, alignItems: 'start' }}>
          {/* List */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, overflow: 'hidden' }}>
            {apps.map((app, i) => (
              <div
                key={app.id}
                onClick={() => openApp(app.id)}
                style={{
                  padding: '16px 24px',
                  borderBottom: i < apps.length - 1 ? '1px solid var(--hairline)' : 'none',
                  cursor: 'pointer',
                  background: selected?.id === app.id ? 'var(--gold-dim)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--serif)', fontSize: '0.95rem', color: 'var(--ink)', marginBottom: 2 }}>
                      {app.name}
                      {app.status === 'received' && (
                        <span style={{ marginLeft: 8, display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', verticalAlign: 'middle' }} />
                      )}
                    </p>
                    <p style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--warm)' }}>
                      {app.job.title} · {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: STATUS_COLOR[app.status], border: `1px solid ${STATUS_COLOR[app.status]}`, borderRadius: 40, padding: '2px 8px' }}>
                    {app.status}
                  </span>
                </div>
                {app.note && (
                  <p style={{ fontFamily: 'var(--serif)', fontSize: '0.82rem', color: 'var(--warm)', marginTop: 6, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    &quot;{app.note}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Detail pane */}
          {selected && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, padding: '24px', position: 'sticky', top: 80 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '1.1rem', color: 'var(--ink)' }}>{selected.name}</h2>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--warm)', marginTop: 2 }}>{selected.email}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--warm)' }}>✕ Close</button>
              </div>

              <p style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--warm)', marginBottom: 12 }}>
                Applied for: <strong style={{ color: 'var(--ink)' }}>{selected.job.title}</strong>
              </p>

              {selected.note && (
                <div style={{ background: 'var(--bg)', border: '1px dashed var(--hairline)', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--warm)', marginBottom: 4 }}>Cover note</p>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: '0.88rem', color: 'var(--ink)', lineHeight: 1.6, fontStyle: 'italic' }}>{selected.note}</p>
                </div>
              )}

              <a
                href={selected.cvSignedUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-block', fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: 40, padding: '7px 16px', textDecoration: 'none', marginBottom: 20 }}
              >
                ↓ Download CV
              </a>

              {selected.status !== 'responded' && selected.status !== 'hired' && (
                <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: 18 }}>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--warm)', letterSpacing: '0.05em', marginBottom: 10 }}>RESPOND</p>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Optional note to the candidate…"
                    rows={3}
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--hairline)', borderRadius: 8, padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--ink)', outline: 'none', resize: 'vertical', marginBottom: 12 }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <ActionBtn onClick={() => respond('forward')} disabled={responding} color="#4caf50">✓ Move forward</ActionBtn>
                    <ActionBtn onClick={() => respond('keep')}   disabled={responding} color="#2196f3">◉ Keep in view</ActionBtn>
                    <ActionBtn onClick={() => respond('reject')} disabled={responding} color="#e57373">✕ Decline</ActionBtn>
                  </div>
                </div>
              )}

              {(selected.status === 'responded') && (
                <p style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: '#4caf50', marginTop: 8 }}>
                  ✓ You responded on {selected.respondedAt ? new Date(selected.respondedAt).toLocaleDateString() : '—'}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ApplicationsClient() {
  return (
    <Suspense fallback={<div style={{ padding: 40, fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--warm)' }}>Loading…</div>}>
      <ApplicationsInner />
    </Suspense>
  )
}

function ActionBtn({ onClick, disabled, color, children }: {
  onClick: () => void; disabled: boolean; color: string; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ flex: 1, background: 'none', border: `1px solid ${color}`, borderRadius: 40, padding: '7px 0', fontFamily: 'var(--mono)', fontSize: '0.7rem', color, cursor: disabled ? 'default' : 'pointer' }}
    >
      {children}
    </button>
  )
}

const selectStyle: React.CSSProperties = {
  background: 'var(--bg)', border: '1px solid var(--hairline)', borderRadius: 40,
  padding: '8px 16px', fontFamily: 'var(--mono)', fontSize: '0.75rem',
  color: 'var(--warm)', cursor: 'pointer', outline: 'none',
}
