'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { employerApi, type EmployerDashboard } from '@/lib/api'

export default function ProfileClient() {
  const router = useRouter()
  const [data,    setData]    = useState<EmployerDashboard | null>(null)
  const [form,    setForm]    = useState({ tagline: '', description: '', craftStatement: '', size: '', founded: '', hqLocation: '', website: '' })
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    employerApi.me()
      .then(d => {
        setData(d)
        setForm({
          tagline:        '',
          description:    '',
          craftStatement: '',
          size:           d.company ? '' : '',
          founded:        '',
          hqLocation:     '',
          website:        '',
        })
      })
      .catch(err => {
        if (err.message?.includes('401')) router.push('/employers/login')
        else setError(err.message)
      })
  }, [router])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const payload: Record<string, string | number> = {}
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '') payload[k] = k === 'founded' ? Number(v) : v
      })
      await employerApi.updateProfile(payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('logo', file)
    try {
      await employerApi.uploadLogo(fd)
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  async function handleLogout() {
    await employerApi.logout()
    router.push('/employers/login')
  }

  if (!data) return <p style={{ padding: 40, fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--warm)' }}>Loading…</p>

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: '1.8rem', color: 'var(--ink)' }}>Company profile</h1>
        <button onClick={handleLogout} style={{ background: 'none', border: '1px solid var(--hairline)', borderRadius: 40, padding: '8px 18px', fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--warm)', cursor: 'pointer' }}>
          Sign out
        </button>
      </div>

      {/* Logo */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, padding: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
        {data.company.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.company.logoUrl} alt="Logo" style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: 10, background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--gold)' }}>
            {data.company.name[0]}
          </div>
        )}
        <div>
          <p style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--ink)', marginBottom: 6 }}>{data.company.name}</p>
          <button onClick={() => fileRef.current?.click()} style={{ background: 'none', border: '1px solid var(--gold)', borderRadius: 40, padding: '6px 14px', fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--gold)', cursor: 'pointer' }}>
            Upload logo
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Section title="Company info">
          <Field label="Tagline">
            <input value={form.tagline} onChange={set('tagline')} placeholder="We build tools for craftspeople." style={inputStyle} />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={set('description')} placeholder="What does your company do?" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>
          <Field label="Craft statement (displayed prominently on your profile)">
            <textarea value={form.craftStatement} onChange={set('craftStatement')} placeholder="Why do you hire the way you hire? What do you believe about work?" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>
        </Section>

        <Section title="Details">
          <Row>
            <Field label="Company size">
              <select value={form.size} onChange={set('size')} style={inputStyle}>
                <option value="">Select…</option>
                {['1–10','11–50','51–200','201–500','500+'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Founded year">
              <input type="number" value={form.founded} onChange={set('founded')} placeholder="2018" style={inputStyle} />
            </Field>
          </Row>
          <Row>
            <Field label="HQ location">
              <input value={form.hqLocation} onChange={set('hqLocation')} placeholder="New York, USA" style={inputStyle} />
            </Field>
            <Field label="Website">
              <input type="url" value={form.website} onChange={set('website')} placeholder="https://yourcompany.com" style={inputStyle} />
            </Field>
          </Row>
        </Section>

        {error && <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: '#e57373' }}>{error}</p>}
        {saved && <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: '#4caf50' }}>✓ Saved successfully</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={saving} style={btnStyle}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, padding: '22px 24px' }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '1rem', color: 'var(--ink)', marginBottom: 16, borderBottom: '1px solid var(--hairline)', paddingBottom: 10 }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  )
}
function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>{children}</div>
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: 180 }}>
      <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--warm)', marginBottom: 5, letterSpacing: '0.05em' }}>{label}</label>
      {children}
    </div>
  )
}
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg)', border: '1px solid var(--hairline)',
  borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--mono)',
  fontSize: '0.82rem', color: 'var(--ink)', outline: 'none',
}
const btnStyle: React.CSSProperties = {
  background: 'var(--gold)', border: 'none', borderRadius: 40, padding: '12px 28px',
  fontFamily: 'var(--mono)', fontSize: '0.85rem', letterSpacing: '0.05em',
  color: 'var(--bg)', cursor: 'pointer',
}
