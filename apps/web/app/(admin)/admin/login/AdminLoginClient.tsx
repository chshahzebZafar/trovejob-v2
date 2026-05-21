'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'

export default function AdminLoginClient() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await adminApi.login({ email, password })
      router.push('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: '100px auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span style={{ fontFamily: 'var(--serif)', fontSize: '1.4rem', color: 'var(--ink)' }}>
          Trove<span style={{ color: 'var(--gold)' }}>Job</span>
        </span>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--warm)', marginTop: 6 }}>
          Admin access only
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 16, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
        </div>
        {error && <p style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: '#e57373', textAlign: 'center' }}>{error}</p>}
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--mono)', fontSize: '0.7rem',
  color: 'var(--warm)', marginBottom: 5, letterSpacing: '0.05em',
}
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg)', border: '1px solid var(--hairline)',
  borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--mono)',
  fontSize: '0.85rem', color: 'var(--ink)', outline: 'none',
}
const btnStyle: React.CSSProperties = {
  background: 'var(--gold)', border: 'none', borderRadius: 40, padding: '13px 0',
  fontFamily: 'var(--mono)', fontSize: '0.85rem', color: 'var(--bg)', cursor: 'pointer',
}
