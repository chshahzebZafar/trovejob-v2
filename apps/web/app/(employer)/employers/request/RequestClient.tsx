'use client'

import { useState } from 'react'
import { employerApi } from '@/lib/api'

export default function RequestClient() {
  const [form, setForm] = useState({
    companyName: '', website: '', description: '', rolesHired: '',
    hiresPerYear: '', linkedinUrl: '', contactName: '', contactEmail: '',
  })
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error,   setError]     = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await employerApi.requestAccess(form)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ maxWidth: 560, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>📋</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: '1.8rem', color: 'var(--ink)', marginBottom: 12 }}>
          Request submitted
        </h1>
        <p style={{ fontFamily: 'var(--serif)', fontSize: '0.95rem', color: 'var(--warm)', lineHeight: 1.7, fontStyle: 'italic' }}>
          We review every request manually. You&apos;ll hear back within 1–2 business days.
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '48px auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: '2rem', color: 'var(--ink)', marginBottom: 8 }}>
          Request employer access
        </h1>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--warm)' }}>
          We vet every employer. Tell us about your company and we&apos;ll be in touch.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 16, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        <Row>
          <Field label="Company name *">
            <input required value={form.companyName} onChange={set('companyName')} placeholder="Acme Corp" style={inputStyle} />
          </Field>
          <Field label="Website *">
            <input required type="url" value={form.website} onChange={set('website')} placeholder="https://acme.com" style={inputStyle} />
          </Field>
        </Row>

        <Field label="What does your company do? *">
          <textarea required value={form.description} onChange={set('description')} placeholder="Brief description…" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
        </Field>

        <Row>
          <Field label="Roles you typically hire for *">
            <input required value={form.rolesHired} onChange={set('rolesHired')} placeholder="Engineers, designers…" style={inputStyle} />
          </Field>
          <Field label="Hires per year *">
            <select required value={form.hiresPerYear} onChange={set('hiresPerYear')} style={inputStyle}>
              <option value="">Select…</option>
              {['1–3','4–10','11–25','26–50','50+'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
        </Row>

        <Field label="LinkedIn company page (optional)">
          <input type="url" value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/company/…" style={inputStyle} />
        </Field>

        <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: 18 }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--warm)', marginBottom: 14, letterSpacing: '0.04em' }}>
            YOUR CONTACT
          </p>
          <Row>
            <Field label="Full name *">
              <input required value={form.contactName} onChange={set('contactName')} placeholder="Jane Smith" style={inputStyle} />
            </Field>
            <Field label="Work email *">
              <input required type="email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="jane@acme.com" style={inputStyle} />
            </Field>
          </Row>
        </div>

        {error && <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: '#e57373', textAlign: 'center' }}>{error}</p>}

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Submitting…' : 'Submit request'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--warm)', marginBottom: 5, letterSpacing: '0.05em' }}>{label}</label>
      {children}
    </div>
  )
}
function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>{children}</div>
}
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg)', border: '1px solid var(--hairline)',
  borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--mono)',
  fontSize: '0.82rem', color: 'var(--ink)', outline: 'none',
}
const btnStyle: React.CSSProperties = {
  background: 'var(--gold)', border: 'none', borderRadius: 40, padding: '13px 0',
  fontFamily: 'var(--mono)', fontSize: '0.88rem', letterSpacing: '0.06em',
  color: 'var(--bg)', cursor: 'pointer',
}
