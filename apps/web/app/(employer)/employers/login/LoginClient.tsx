'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { employerApi } from '@/lib/api'

export default function LoginClient() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await employerApi.login({ email, password })
      router.push('/employers/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: '2rem', color: 'var(--ink)', marginBottom: 8 }}>
          Employer portal
        </h1>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--warm)' }}>
          Sign in to manage your listings and inbox.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 16, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        <Field label="Email">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" style={inputStyle} />
        </Field>
        <Field label="Password">
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
        </Field>

        {error && <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: '#e57373', textAlign: 'center' }}>{error}</p>}

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--warm)', textAlign: 'center' }}>
          Don&apos;t have access?{' '}
          <Link href="/employers/request" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
            Request access →
          </Link>
        </p>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--warm)', marginBottom: 5, letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg)', border: '1px solid var(--hairline)',
  borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--mono)',
  fontSize: '0.85rem', color: 'var(--ink)', outline: 'none',
}
const btnStyle: React.CSSProperties = {
  background: 'var(--gold)', border: 'none', borderRadius: 40, padding: '13px 0',
  fontFamily: 'var(--mono)', fontSize: '0.88rem', letterSpacing: '0.06em',
  color: 'var(--bg)', cursor: 'pointer',
}
