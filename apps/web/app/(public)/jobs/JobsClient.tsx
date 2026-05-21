'use client'

import { useState, useEffect, useCallback } from 'react'
import JobCard from '@/components/JobCard'
import { jobsApi, type JobSummary, type JobFilters } from '@/lib/api'

const LOCATION_OPTS = [
  { value: '', label: 'All locations' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
]

const EMPLOYMENT_OPTS = [
  { value: '', label: 'All types' },
  { value: 'fulltime', label: 'Full-time' },
  { value: 'parttime', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
]

export default function JobsClient() {
  const [jobs, setJobs]           = useState<JobSummary[]>([])
  const [total, setTotal]         = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage]           = useState(1)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  const [keyword,        setKeyword]        = useState('')
  const [locationType,   setLocationType]   = useState('')
  const [employmentType, setEmploymentType] = useState('')
  const [salaryMin,      setSalaryMin]      = useState('')

  const fetch = useCallback(async (filters: JobFilters) => {
    setLoading(true)
    setError('')
    try {
      const res = await jobsApi.list(filters)
      setJobs(res.jobs)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const filters: JobFilters = {
      page,
      ...(keyword        ? { keyword }        : {}),
      ...(locationType   ? { locationType }   : {}),
      ...(employmentType ? { employmentType } : {}),
      ...(salaryMin      ? { salaryMin: Number(salaryMin) } : {}),
    }
    fetch(filters)
  }, [fetch, page, keyword, locationType, employmentType, salaryMin])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: 'var(--serif)',
            fontWeight: 300,
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            color: 'var(--ink)',
            marginBottom: 8,
          }}
        >
          Browse <span style={{ color: 'var(--gold)' }}>curated</span> jobs
        </h1>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--warm)' }}>
          {total > 0 ? `${total} open ${total === 1 ? 'role' : 'roles'} from verified employers` : 'No roles found matching your filters'}
        </p>
      </div>

      {/* Filter bar */}
      <form
        onSubmit={handleSearch}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 32,
          alignItems: 'flex-end',
        }}
      >
        <div style={{ flex: '1 1 200px' }}>
          <label style={labelStyle}>Keyword</label>
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Role, skill, company…"
            style={inputStyle}
          />
        </div>

        <div style={{ flex: '1 1 140px' }}>
          <label style={labelStyle}>Location</label>
          <select
            value={locationType}
            onChange={e => { setLocationType(e.target.value); setPage(1) }}
            style={inputStyle}
          >
            {LOCATION_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div style={{ flex: '1 1 140px' }}>
          <label style={labelStyle}>Type</label>
          <select
            value={employmentType}
            onChange={e => { setEmploymentType(e.target.value); setPage(1) }}
            style={inputStyle}
          >
            {EMPLOYMENT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div style={{ flex: '1 1 120px' }}>
          <label style={labelStyle}>Min salary ($/yr)</label>
          <input
            type="number"
            value={salaryMin}
            onChange={e => setSalaryMin(e.target.value)}
            placeholder="e.g. 60000"
            style={inputStyle}
          />
        </div>

        <button type="submit" style={btnStyle}>Search</button>
      </form>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--warm)' }}>
            Loading jobs…
          </p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: '#e57373' }}>{error}</p>
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', color: 'var(--warm)', fontStyle: 'italic' }}>
            No roles match your filters.
          </p>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--warm)', marginTop: 8 }}>
            Try adjusting your search or{' '}
            <button
              onClick={() => { setKeyword(''); setLocationType(''); setEmploymentType(''); setSalaryMin(''); setPage(1) }}
              style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '0.78rem' }}
            >
              clear all filters
            </button>
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 16,
            }}
          >
            {jobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
                marginTop: 40,
              }}
            >
              <PagBtn disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</PagBtn>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--warm)', padding: '0 12px' }}>
                {page} / {totalPages}
              </span>
              <PagBtn disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</PagBtn>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PagBtn({ children, disabled, onClick }: {
  children: React.ReactNode; disabled: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: 'var(--mono)',
        fontSize: '0.78rem',
        padding: '8px 16px',
        borderRadius: 40,
        border: '1px solid var(--hairline)',
        background: 'var(--surface)',
        color: disabled ? 'var(--hairline)' : 'var(--warm)',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--mono)',
  fontSize: '0.7rem',
  color: 'var(--warm)',
  marginBottom: 4,
  letterSpacing: '0.05em',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid var(--hairline)',
  borderRadius: 8,
  padding: '8px 12px',
  fontFamily: 'var(--mono)',
  fontSize: '0.82rem',
  color: 'var(--ink)',
  outline: 'none',
}

const btnStyle: React.CSSProperties = {
  background: 'var(--gold)',
  border: 'none',
  borderRadius: 40,
  padding: '9px 24px',
  fontFamily: 'var(--mono)',
  fontSize: '0.8rem',
  color: 'var(--bg)',
  cursor: 'pointer',
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
}
