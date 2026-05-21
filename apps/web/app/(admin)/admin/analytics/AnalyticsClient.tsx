'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'

interface Analytics {
  totalJobs: number; activeJobs: number; totalCompanies: number
  totalApplications: number; avgResponseRate: number; avgResponseDays: number
  jobsByLocationType: Record<string, number>
  jobsByEmploymentType: Record<string, number>
  applicationsByStatus: Record<string, number>
  topCompanies: Array<{ name: string; totalApplications: number; responseRate: number }>
}

export default function AnalyticsClient() {
  const router = useRouter()
  const [data,    setData]    = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.analytics()
      .then(r => setData(r as Analytics))
      .catch(err => { if (err.message?.includes('401')) router.push('/admin/login') })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <div style={{ padding: 40 }}><p style={mono}>Loading…</p></div>
  if (!data)   return null

  return (
    <div style={{ padding: '40px 36px', maxWidth: 900 }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: '1.8rem', color: 'var(--ink)', marginBottom: 32 }}>
        Analytics
      </h1>

      {/* Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
        <AStat label="Total jobs"       value={data.totalJobs} />
        <AStat label="Active jobs"      value={data.activeJobs} />
        <AStat label="Companies"        value={data.totalCompanies} />
        <AStat label="Applications"     value={data.totalApplications} />
        <AStat label="Avg response rate" value={`${data.avgResponseRate.toFixed(0)}%`} />
        <AStat label="Avg response time" value={`${data.avgResponseDays.toFixed(1)}d`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <Breakdown title="By location" data={data.jobsByLocationType} />
        <Breakdown title="By employment type" data={data.jobsByEmploymentType} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <Breakdown title="Applications by status" data={data.applicationsByStatus} />

        {/* Top companies */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, padding: '20px 22px' }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '0.95rem', color: 'var(--ink)', marginBottom: 14 }}>Top companies by applications</h3>
          {data.topCompanies.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < data.topCompanies.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: '0.88rem', color: 'var(--ink)' }}>{c.name}</span>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ ...mono, fontSize: '0.7rem', color: 'var(--warm)' }}>{c.totalApplications} apps</span>
                <span style={{ ...mono, fontSize: '0.7rem', color: c.responseRate >= 70 ? '#4caf50' : 'var(--warm)' }}>{c.responseRate}% resp.</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 10, padding: '16px 18px' }}>
      <p style={{ fontFamily: 'var(--mono)', fontSize: '0.64rem', color: 'var(--warm)', letterSpacing: '0.06em', marginBottom: 8 }}>{label.toUpperCase()}</p>
      <p style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: '1.6rem', color: 'var(--ink)' }}>{value}</p>
    </div>
  )
}

function Breakdown({ title, data }: { title: string; data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, padding: '20px 22px' }}>
      <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '0.95rem', color: 'var(--ink)', marginBottom: 14 }}>{title}</h3>
      {Object.entries(data).map(([k, v]) => (
        <div key={k} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--warm)' }}>{k}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--ink)' }}>{v}</span>
          </div>
          <div style={{ height: 4, background: 'var(--hairline)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${(v / total) * 100}%`, background: 'var(--gold)', borderRadius: 2 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

const mono: React.CSSProperties = { fontFamily: 'var(--mono)' }
