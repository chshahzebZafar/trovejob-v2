'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { adminApi, type AdminDashboard } from '@/lib/api'

export default function AdminDashboardClient() {
  const router = useRouter()
  const [data, setData]     = useState<AdminDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    adminApi.dashboard()
      .then(setData)
      .catch(err => {
        if (err.message?.includes('401')) router.push('/admin/login')
        else setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <Pad><p style={mono}>Loading…</p></Pad>
  if (error)   return <Pad><p style={{ ...mono, color: '#e57373' }}>{error}</p></Pad>
  if (!data)   return null

  const { stats, recentRequests } = data

  return (
    <div style={{ padding: '40px 36px', maxWidth: 900 }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: '1.8rem', color: 'var(--ink)', marginBottom: 32 }}>
        Dashboard
      </h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 36 }}>
        <AdminStat label="Companies"     value={stats.totalCompanies} />
        <AdminStat label="Active jobs"   value={stats.activeListings} />
        <AdminStat label="Applications"  value={stats.totalApplications} />
        <AdminStat label="Pending"       value={stats.pendingRequests} accent={stats.pendingRequests > 0} />
        <AdminStat label="Avg response"  value={`${stats.avgResponseRate.toFixed(0)}%`} />
      </div>

      {/* Pending requests */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '1.05rem', color: 'var(--ink)' }}>
            Recent employer requests
          </h2>
          <Link href="/admin/employer-requests" style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--gold)', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>
        {recentRequests.length === 0 ? (
          <p style={{ ...mono, color: 'var(--warm)', fontStyle: 'italic' }}>No pending requests.</p>
        ) : (
          recentRequests.map(r => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--hairline)' }}>
              <div>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '0.92rem', color: 'var(--ink)' }}>{r.companyName}</p>
                <p style={{ ...mono, fontSize: '0.68rem', color: 'var(--warm)' }}>{r.contactEmail}</p>
              </div>
              <span style={{ ...mono, fontSize: '0.65rem', color: r.status === 'pending' ? 'var(--gold)' : r.status === 'approved' ? '#4caf50' : '#e57373', border: `1px solid currentColor`, borderRadius: 40, padding: '2px 8px' }}>
                {r.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function AdminStat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${accent ? 'var(--gold)' : 'var(--hairline)'}`, borderRadius: 10, padding: '16px 18px' }}>
      <p style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--warm)', letterSpacing: '0.06em', marginBottom: 8 }}>{label.toUpperCase()}</p>
      <p style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: '1.8rem', color: accent ? 'var(--gold)' : 'var(--ink)' }}>{value}</p>
    </div>
  )
}

function Pad({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '60px 36px' }}>{children}</div>
}
const mono: React.CSSProperties = { fontFamily: 'var(--mono)', fontSize: '0.8rem' }
