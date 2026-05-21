'use client'

import { useState, useRef } from 'react'
import { applicationsApi } from '@/lib/api'

interface Props {
  jobId: string
  jobTitle: string
  companyName: string
}

export default function ApplyForm({ jobId }: Props) {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [note,     setNote]     = useState('')
  const [file,     setFile]     = useState<File | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [token,    setToken]    = useState('')   // success state

  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('Please attach your CV (PDF)'); return }
    if (file.size > 5 * 1024 * 1024) { setError('CV must be under 5 MB'); return }

    setLoading(true)
    setError('')

    const fd = new FormData()
    fd.append('jobId', jobId)
    fd.append('name',  name)
    fd.append('email', email)
    if (note) fd.append('note', note)
    fd.append('cv', file)

    try {
      const res = await applicationsApi.submit(fd)
      setToken(res.token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (token) {
    return (
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 16,
          padding: '40px 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2.4rem', marginBottom: 16 }}>✉️</div>
        <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '1.5rem', color: 'var(--ink)', marginBottom: 12 }}>
          Application sent!
        </h2>
        <p style={{ fontFamily: 'var(--serif)', fontSize: '0.95rem', color: 'var(--warm)', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>
          We&apos;ve emailed a confirmation link so you can track your application status at any time.
        </p>
        <div
          style={{
            background: 'var(--bg)',
            border: '1px dashed var(--hairline)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 24,
          }}
        >
          <p style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--warm)', marginBottom: 4 }}>
            Your tracking token
          </p>
          <code style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem', color: 'var(--ink)', wordBreak: 'break-all' }}>
            {token}
          </code>
        </div>
        <a
          href={`/application/${token}`}
          style={{
            display: 'inline-block',
            fontFamily: 'var(--mono)',
            fontSize: '0.8rem',
            color: 'var(--gold)',
            textDecoration: 'none',
            border: '1px solid var(--gold)',
            borderRadius: 40,
            padding: '10px 24px',
          }}
        >
          Track your application →
        </a>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 16,
        padding: '32px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <Field label="Full name" required>
        <input
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Jane Smith"
          style={inputStyle}
        />
      </Field>

      <Field label="Email address" required>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="jane@example.com"
          style={inputStyle}
        />
      </Field>

      <Field label="CV / Résumé (PDF, max 5 MB)" required>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${file ? 'var(--gold)' : 'var(--hairline)'}`,
            borderRadius: 8,
            padding: '20px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
        >
          {file ? (
            <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--gold)' }}>
              ✓ {file.name}
            </p>
          ) : (
            <p style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--warm)' }}>
              Click to upload your PDF
            </p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            style={{ display: 'none' }}
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) setFile(f)
            }}
          />
        </div>
      </Field>

      <Field label="Cover note (optional)">
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Anything you'd like the employer to know…"
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </Field>

      {error && (
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: '#e57373', textAlign: 'center' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          background: loading ? 'var(--warm)' : 'var(--gold)',
          border: 'none',
          borderRadius: 40,
          padding: '14px 0',
          fontFamily: 'var(--mono)',
          fontSize: '0.88rem',
          letterSpacing: '0.06em',
          color: 'var(--bg)',
          cursor: loading ? 'default' : 'pointer',
          transition: 'background 0.2s',
        }}
      >
        {loading ? 'Sending…' : 'Submit application'}
      </button>

      <p style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--warm)', textAlign: 'center' }}>
        Your CV is stored securely. Only the employer can access it.
      </p>
    </form>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--warm)', letterSpacing: '0.05em', marginBottom: 6 }}>
        {label}{required && <span style={{ color: 'var(--gold)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid var(--hairline)',
  borderRadius: 8,
  padding: '10px 14px',
  fontFamily: 'var(--mono)',
  fontSize: '0.85rem',
  color: 'var(--ink)',
  outline: 'none',
}
