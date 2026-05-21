'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { employerApi } from '@/lib/api'

interface Form {
  title: string; salaryMin: string; salaryMax: string; currency: string
  locationType: string; city: string; employmentType: string
  description: string; craftDescription: string; requirements: string
  benefits: string; deadline: string
}

const INITIAL: Form = {
  title: '', salaryMin: '', salaryMax: '', currency: 'USD',
  locationType: 'remote', city: '', employmentType: 'fulltime',
  description: '', craftDescription: '', requirements: '',
  benefits: '', deadline: '',
}

export default function NewJobClient() {
  const router = useRouter()
  const [form,    setForm]    = useState<Form>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = (k: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const payload = {
        ...form,
        salaryMin: Number(form.salaryMin),
        salaryMax: Number(form.salaryMax),
      }
      await employerApi.createJob(payload)
      router.push('/employers/jobs')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job')
    } finally {
      setLoading(false)
    }
  }

  // min deadline = tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: '2rem', color: 'var(--ink)', marginBottom: 8 }}>
        Post a new role
      </h1>
      <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--warm)', marginBottom: 32 }}>
        Your listing goes live as a draft. Set it to Active when ready.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Basic */}
        <Section title="Role details">
          <Field label="Job title *">
            <input required value={form.title} onChange={set('title')} placeholder="Senior Product Designer" style={inputStyle} />
          </Field>
          <Row>
            <Field label="Employment type *">
              <select required value={form.employmentType} onChange={set('employmentType')} style={inputStyle}>
                <option value="fulltime">Full-time</option>
                <option value="parttime">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </Field>
            <Field label="Location type *">
              <select required value={form.locationType} onChange={set('locationType')} style={inputStyle}>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </Field>
          </Row>
          {form.locationType !== 'remote' && (
            <Field label="City">
              <input value={form.city} onChange={set('city')} placeholder="New York" style={inputStyle} />
            </Field>
          )}
        </Section>

        {/* Salary */}
        <Section title="Compensation">
          <Row>
            <Field label="Currency">
              <select value={form.currency} onChange={set('currency')} style={inputStyle}>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
                <option value="PKR">PKR</option>
              </select>
            </Field>
            <Field label="Min salary/yr *">
              <input required type="number" value={form.salaryMin} onChange={set('salaryMin')} placeholder="60000" style={inputStyle} />
            </Field>
            <Field label="Max salary/yr *">
              <input required type="number" value={form.salaryMax} onChange={set('salaryMax')} placeholder="90000" style={inputStyle} />
            </Field>
          </Row>
        </Section>

        {/* Description */}
        <Section title="Job description">
          <Field label="About the role *">
            <textarea required value={form.description} onChange={set('description')} placeholder="Describe the role, team, and day-to-day responsibilities…" rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>
          <Field label="Why this role matters (craft statement — shown prominently)">
            <textarea value={form.craftDescription} onChange={set('craftDescription')} placeholder="What makes this role special? What problem will they solve?" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>
          <Field label="Requirements *">
            <textarea required value={form.requirements} onChange={set('requirements')} placeholder="Skills, experience, and qualifications…" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>
          <Field label="Benefits *">
            <textarea required value={form.benefits} onChange={set('benefits')} placeholder="Compensation, PTO, remote work, equity…" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>
        </Section>

        {/* Deadline */}
        <Section title="Application deadline">
          <Field label="Closing date *">
            <input required type="date" value={form.deadline} onChange={set('deadline')} min={minDate} style={inputStyle} />
          </Field>
        </Section>

        {error && <p style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: '#e57373', textAlign: 'center' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => router.back()} style={ghostBtn}>Cancel</button>
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Saving…' : 'Save as draft'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, padding: '24px 24px' }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '1rem', color: 'var(--ink)', marginBottom: 18, borderBottom: '1px solid var(--hairline)', paddingBottom: 10 }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </div>
  )
}
function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>{children}</div>
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: 160 }}>
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
const ghostBtn: React.CSSProperties = {
  background: 'none', border: '1px solid var(--hairline)', borderRadius: 40, padding: '12px 24px',
  fontFamily: 'var(--mono)', fontSize: '0.82rem', color: 'var(--warm)', cursor: 'pointer',
}
