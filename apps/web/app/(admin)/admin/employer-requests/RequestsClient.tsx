'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'

interface Request {
  id: string; companyName: string; website: string; description: string
  rolesHired: string; hiresPerYear: string; linkedinUrl?: string
  contactName: string; contactEmail: string; status: string
  adminNotes?: string; createdAt: string
}

export default function RequestsClient() {
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [selected, setSelected] = useState<Request | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('pending')
  const [rejectNote, setRejectNote] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    setLoading(true)
    adminApi.employerRequests(filter)
      .then(r => setRequests(r.requests as Request[]))
      .catch(err => {
        if (err.message?.includes('401')) router.push('/admin/login')
      })
      .finally(() => setLoading(false))
  }, [filter, router])

  async function approve(id: string) {
    setProcessing(true)
    try {
      await adminApi.approveRequest(id)
      setRequests(r => r.filter(x => x.id !== id))
      setSelected(null)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setProcessing(false)
    }
  }

  async function reject(id: string) {
    setProcessing(true)
    try {
      await adminApi.rejectRequest(id, { reason: rejectNote })
      setRequests(r => r.filter(x => x.id !== id))
      setSelected(null); setRejectNote('')
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ padding: '40px 36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: '1.8rem', color: 'var(--ink)' }}>
          Employer requests
        </h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {['pending', 'approved', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                background: filter === s ? 'var(--gold)' : 'var(--bg)',
                border: `1px solid ${filter === s ? 'var(--gold)' : 'var(--hairline)'}`,
                borderRadius: 40, padding: '6px 16px',
                fontFamily: 'var(--mono)', fontSize: '0.72rem',
                color: filter === s ? 'var(--bg)' : 'var(--warm)',
                cursor: 'pointer',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={mono}>Loading…</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20, alignItems: 'start' }}>
          {/* List */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, overflow: 'hidden' }}>
            {requests.length === 0 ? (
              <p style={{ ...mono, color: 'var(--warm)', padding: '32px 24px', fontStyle: 'italic' }}>No {filter} requests.</p>
            ) : requests.map((req, i) => (
              <div
                key={req.id}
                onClick={() => setSelected(req)}
                style={{
                  padding: '16px 22px',
                  borderBottom: i < requests.length - 1 ? '1px solid var(--hairline)' : 'none',
                  cursor: 'pointer',
                  background: selected?.id === req.id ? 'var(--gold-dim)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--serif)', fontSize: '0.95rem', color: 'var(--ink)', marginBottom: 2 }}>{req.companyName}</p>
                    <p style={{ ...mono, fontSize: '0.7rem', color: 'var(--warm)' }}>{req.contactName} · {req.contactEmail}</p>
                  </div>
                  <p style={{ ...mono, fontSize: '0.68rem', color: 'var(--warm)' }}>
                    {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, padding: 24, position: 'sticky', top: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '1.1rem', color: 'var(--ink)' }}>{selected.companyName}</h2>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', ...mono, color: 'var(--warm)' }}>✕</button>
              </div>
              <a href={selected.website} target="_blank" rel="noopener noreferrer" style={{ ...mono, fontSize: '0.72rem', color: 'var(--gold)', display: 'block', marginBottom: 12 }}>{selected.website} ↗</a>

              <InfoRow label="Contact"  value={`${selected.contactName} — ${selected.contactEmail}`} />
              <InfoRow label="Roles"    value={selected.rolesHired} />
              <InfoRow label="Hires/yr" value={selected.hiresPerYear} />
              {selected.linkedinUrl && <InfoRow label="LinkedIn" value={selected.linkedinUrl} />}

              <div style={{ margin: '14px 0', background: 'var(--bg)', borderRadius: 8, padding: '12px 14px' }}>
                <p style={{ ...mono, fontSize: '0.68rem', color: 'var(--warm)', marginBottom: 4 }}>Description</p>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '0.88rem', color: 'var(--ink)', lineHeight: 1.6 }}>{selected.description}</p>
              </div>

              {selected.status === 'pending' && (
                <>
                  <textarea
                    value={rejectNote}
                    onChange={e => setRejectNote(e.target.value)}
                    placeholder="Rejection reason (optional)…"
                    rows={2}
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--hairline)', borderRadius: 8, padding: '8px 12px', ...mono, fontSize: '0.78rem', color: 'var(--ink)', outline: 'none', resize: 'none', marginBottom: 12 }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => approve(selected.id)}
                      disabled={processing}
                      style={{ flex: 1, background: '#4caf50', border: 'none', borderRadius: 40, padding: '10px 0', ...mono, fontSize: '0.78rem', color: '#fff', cursor: 'pointer' }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => reject(selected.id)}
                      disabled={processing}
                      style={{ flex: 1, background: 'none', border: '1px solid #e57373', borderRadius: 40, padding: '10px 0', ...mono, fontSize: '0.78rem', color: '#e57373', cursor: 'pointer' }}
                    >
                      ✕ Reject
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
      <span style={{ ...mono, fontSize: '0.68rem', color: 'var(--warm)', width: 64, flexShrink: 0 }}>{label}</span>
      <span style={{ ...mono, fontSize: '0.72rem', color: 'var(--ink)' }}>{value}</span>
    </div>
  )
}

const mono: React.CSSProperties = { fontFamily: 'var(--mono)', fontSize: '0.8rem' }
