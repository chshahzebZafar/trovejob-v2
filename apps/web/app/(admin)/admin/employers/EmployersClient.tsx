'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'

interface Employer {
  id: string; name: string; slug: string; planStatus: string; responseRate: number
  totalApplications: number; verified: boolean; createdAt: string
  plan?: { id: string; name: string }
}
interface Plan { id: string; name: string; priceMonthly: number }

export default function EmployersClient() {
  const router = useRouter()
  const [employers, setEmployers] = useState<Employer[]>([])
  const [plans,     setPlans]     = useState<Plan[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([adminApi.employers(), adminApi.plans()])
      .then(([e, p]) => {
        setEmployers(e.employers as Employer[])
        setPlans(p.plans as Plan[])
      })
      .catch(err => {
        if (err.message?.includes('401')) router.push('/admin/login')
      })
      .finally(() => setLoading(false))
  }, [router])

  async function changePlan(id: string, planId: string) {
    await adminApi.updateEmployerPlan(id, planId)
    setEmployers(emps => emps.map(e => e.id === id ? { ...e, plan: plans.find(p => p.id === planId) } : e))
  }

  async function toggleSuspend(id: string, suspended: boolean) {
    await adminApi.suspendEmployer(id, suspended)
    setEmployers(emps => emps.map(e => e.id === id ? { ...e, planStatus: suspended ? 'suspended' : 'active' } : e))
  }

  return (
    <div style={{ padding: '40px 36px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: '1.8rem', color: 'var(--ink)', marginBottom: 28 }}>
        Employers ({employers.length})
      </h1>

      {loading ? (
        <p style={mono}>Loading…</p>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--hairline)' }}>
                {['Company', 'Plan', 'Status', 'Response rate', 'Applications', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', ...mono, fontSize: '0.66rem', color: 'var(--warm)', letterSpacing: '0.06em' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employers.map((emp, i) => (
                <tr key={emp.id} style={{ borderBottom: i < employers.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <p style={{ fontFamily: 'var(--serif)', fontSize: '0.92rem', color: 'var(--ink)' }}>{emp.name}</p>
                    {emp.verified && <span style={{ ...mono, fontSize: '0.62rem', color: '#4caf50' }}>✓ verified</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <select
                      value={emp.plan?.id ?? ''}
                      onChange={e => changePlan(emp.id, e.target.value)}
                      style={{ ...mono, fontSize: '0.72rem', background: 'var(--bg)', border: '1px solid var(--hairline)', borderRadius: 6, padding: '4px 8px', color: 'var(--ink)' }}
                    >
                      <option value="">No plan</option>
                      {plans.map(p => <option key={p.id} value={p.id}>{p.name} (${p.priceMonthly}/mo)</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ ...mono, fontSize: '0.65rem', color: STATUS_COLOR[emp.planStatus] ?? 'var(--warm)', border: `1px solid ${STATUS_COLOR[emp.planStatus] ?? 'var(--hairline)'}`, borderRadius: 40, padding: '2px 8px' }}>
                      {emp.planStatus}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', ...mono, fontSize: '0.78rem', color: emp.responseRate >= 70 ? '#4caf50' : 'var(--warm)' }}>
                    {emp.responseRate}%
                  </td>
                  <td style={{ padding: '12px 16px', ...mono, fontSize: '0.78rem', color: 'var(--warm)' }}>
                    {emp.totalApplications}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => toggleSuspend(emp.id, emp.planStatus !== 'suspended')}
                      style={{
                        ...mono, fontSize: '0.68rem',
                        background: 'none',
                        border: `1px solid ${emp.planStatus === 'suspended' ? '#4caf50' : '#e57373'}`,
                        borderRadius: 40, padding: '4px 10px',
                        color: emp.planStatus === 'suspended' ? '#4caf50' : '#e57373',
                        cursor: 'pointer',
                      }}
                    >
                      {emp.planStatus === 'suspended' ? 'Reinstate' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const STATUS_COLOR: Record<string, string> = {
  trial: '#b8913a', active: '#4caf50', suspended: '#e57373', cancelled: '#757575',
}
const mono: React.CSSProperties = { fontFamily: 'var(--mono)', fontSize: '0.8rem' }
