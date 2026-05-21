'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'

interface Plan {
  id: string; name: string; priceMonthly: number; maxListings: number
  hasProfile: boolean; hasCvAccess: boolean; hasAnalytics: boolean; hasFeaturedBoost: boolean
}

const NEW: Omit<Plan, 'id'> = {
  name: '', priceMonthly: 0, maxListings: 3,
  hasProfile: false, hasCvAccess: false, hasAnalytics: false, hasFeaturedBoost: false,
}

export default function PlansClient() {
  const router  = useRouter()
  const [plans,   setPlans]   = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<(Omit<Plan, 'id'> & { id?: string }) | null>(null)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    adminApi.plans()
      .then(r => setPlans(r.plans as Plan[]))
      .catch(err => { if (err.message?.includes('401')) router.push('/admin/login') })
      .finally(() => setLoading(false))
  }, [router])

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    try {
      if (editing.id) {
        await adminApi.updatePlan(editing.id, editing)
        setPlans(ps => ps.map(p => p.id === editing.id ? { ...editing, id: editing.id! } : p))
      } else {
        const res = await adminApi.createPlan(editing) as { plan: Plan }
        setPlans(ps => [...ps, res.plan])
      }
      setEditing(null)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const toggle = (k: keyof Omit<Plan, 'id' | 'name' | 'priceMonthly' | 'maxListings'>) =>
    setEditing(e => e ? { ...e, [k]: !e[k] } : null)

  return (
    <div style={{ padding: '40px 36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: '1.8rem', color: 'var(--ink)' }}>Plans</h1>
        <button onClick={() => setEditing(NEW)} style={btnStyle}>+ New plan</button>
      </div>

      {loading ? <p style={mono}>Loading…</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          {plans.map(plan => (
            <div
              key={plan.id}
              style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, padding: '20px 20px', cursor: 'pointer' }}
              onClick={() => setEditing(plan)}
            >
              <p style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', color: 'var(--ink)', marginBottom: 4 }}>{plan.name}</p>
              <p style={{ ...mono, fontSize: '1.2rem', color: 'var(--gold)', marginBottom: 14 }}>
                ${plan.priceMonthly}<span style={{ fontSize: '0.7rem', color: 'var(--warm)' }}>/mo</span>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <Feature active label={`${plan.maxListings === -1 ? 'Unlimited' : plan.maxListings} listings`} />
                <Feature active={plan.hasProfile}      label="Company profile" />
                <Feature active={plan.hasCvAccess}     label="CV access" />
                <Feature active={plan.hasAnalytics}    label="Analytics" />
                <Feature active={plan.hasFeaturedBoost} label="Featured boost" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit drawer */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg)', borderRadius: 16, padding: '32px 28px', width: 420, maxWidth: '90vw' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '1.2rem', color: 'var(--ink)', marginBottom: 20 }}>
              {editing.id ? 'Edit plan' : 'New plan'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <EField label="Name"><input value={editing.name} onChange={e => setEditing(x => x ? { ...x, name: e.target.value } : null)} style={inputStyle} /></EField>
              <EField label="Price / month ($)"><input type="number" value={editing.priceMonthly} onChange={e => setEditing(x => x ? { ...x, priceMonthly: Number(e.target.value) } : null)} style={inputStyle} /></EField>
              <EField label="Max listings (-1 = unlimited)"><input type="number" value={editing.maxListings} onChange={e => setEditing(x => x ? { ...x, maxListings: Number(e.target.value) } : null)} style={inputStyle} /></EField>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(['hasProfile', 'hasCvAccess', 'hasAnalytics', 'hasFeaturedBoost'] as const).map(k => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={editing[k]} onChange={() => toggle(k)} />
                    <span style={{ ...mono, fontSize: '0.78rem', color: 'var(--ink)' }}>
                      {k.replace('has', '').replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={() => setEditing(null)} style={ghostBtn}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={btnStyle}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Feature({ active, label }: { active: boolean; label: string }) {
  return <span style={{ ...mono, fontSize: '0.7rem', color: active ? 'var(--ink)' : 'var(--hairline)' }}>{active ? '✓' : '✗'} {label}</span>
}
function EField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={{ display: 'block', ...mono, fontSize: '0.68rem', color: 'var(--warm)', marginBottom: 4 }}>{label}</label>{children}</div>
}
const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 8, padding: '9px 12px', fontFamily: 'var(--mono)', fontSize: '0.82rem', color: 'var(--ink)', outline: 'none' }
const btnStyle: React.CSSProperties = { background: 'var(--gold)', border: 'none', borderRadius: 40, padding: '10px 22px', fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--bg)', cursor: 'pointer' }
const ghostBtn: React.CSSProperties = { background: 'none', border: '1px solid var(--hairline)', borderRadius: 40, padding: '10px 20px', fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--warm)', cursor: 'pointer' }
const mono: React.CSSProperties = { fontFamily: 'var(--mono)' }
