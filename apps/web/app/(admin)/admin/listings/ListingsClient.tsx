'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'

interface Listing {
  id: string; title: string; slug: string; status: string; featured: boolean
  locationType: string; employmentType: string; deadline: string; createdAt: string
  company: { name: string }
  _count: { applications: number }
}

const STATUS_COLOR: Record<string, string> = {
  draft: '#757575', active: '#4caf50', filled: '#2196f3', paused: '#b8913a',
}

export default function ListingsClient() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    adminApi.listings()
      .then(r => setListings(r.listings as Listing[]))
      .catch(err => { if (err.message?.includes('401')) router.push('/admin/login') })
      .finally(() => setLoading(false))
  }, [router])

  async function toggleFeatured(id: string, featured: boolean) {
    await adminApi.updateListing(id, { featured })
    setListings(ls => ls.map(l => l.id === id ? { ...l, featured } : l))
  }

  async function changeStatus(id: string, status: string) {
    await adminApi.updateListing(id, { status })
    setListings(ls => ls.map(l => l.id === id ? { ...l, status } : l))
  }

  return (
    <div style={{ padding: '40px 36px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: '1.8rem', color: 'var(--ink)', marginBottom: 28 }}>
        All listings ({listings.length})
      </h1>

      {loading ? <p style={mono}>Loading…</p> : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--hairline)' }}>
                {['Job', 'Company', 'Status', 'Featured', 'Apps', 'Deadline'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', ...mono, fontSize: '0.65rem', color: 'var(--warm)', letterSpacing: '0.06em' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listings.map((l, i) => (
                <tr key={l.id} style={{ borderBottom: i < listings.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <p style={{ fontFamily: 'var(--serif)', fontSize: '0.9rem', color: 'var(--ink)' }}>{l.title}</p>
                    <p style={{ ...mono, fontSize: '0.66rem', color: 'var(--warm)' }}>{l.locationType} · {l.employmentType}</p>
                  </td>
                  <td style={{ padding: '12px 14px', ...mono, fontSize: '0.78rem', color: 'var(--warm)' }}>{l.company.name}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <select
                      value={l.status}
                      onChange={e => changeStatus(l.id, e.target.value)}
                      style={{ ...mono, fontSize: '0.7rem', color: STATUS_COLOR[l.status] ?? 'var(--warm)', background: 'var(--bg)', border: '1px solid var(--hairline)', borderRadius: 40, padding: '4px 10px' }}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="filled">Filled</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      onClick={() => toggleFeatured(l.id, !l.featured)}
                      style={{ background: 'none', border: `1px solid ${l.featured ? 'var(--gold)' : 'var(--hairline)'}`, borderRadius: 40, padding: '4px 10px', ...mono, fontSize: '0.68rem', color: l.featured ? 'var(--gold)' : 'var(--warm)', cursor: 'pointer' }}
                    >
                      {l.featured ? '★ Featured' : '☆ Feature'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 14px', ...mono, fontSize: '0.78rem', color: 'var(--warm)' }}>{l._count.applications}</td>
                  <td style={{ padding: '12px 14px', ...mono, fontSize: '0.75rem', color: 'var(--warm)' }}>
                    {new Date(l.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
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

const mono: React.CSSProperties = { fontFamily: 'var(--mono)' }
