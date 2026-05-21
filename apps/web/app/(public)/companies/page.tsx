import type { Metadata } from 'next'
import { companiesApi } from '@/lib/api'
import CompanyCard from '@/components/CompanyCard'

export const metadata: Metadata = { title: 'Companies' }

export default async function CompaniesPage() {
  let companies: Awaited<ReturnType<typeof companiesApi.list>>['companies'] = []
  let error = ''

  try {
    const res = await companiesApi.list()
    companies = res.companies
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load companies'
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--ink)', marginBottom: 8 }}>
          Verified <span style={{ color: 'var(--gold)' }}>companies</span>
        </h1>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--warm)' }}>
          Every company on TroveJob is manually reviewed. We track response rates so you know who
          actually follows through.
        </p>
      </div>

      {error ? (
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: '#e57373' }}>{error}</p>
      ) : companies.length === 0 ? (
        <p style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--warm)', fontStyle: 'italic' }}>
          No companies yet — check back soon.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {companies.map(c => <CompanyCard key={c.id} company={c} />)}
        </div>
      )}
    </div>
  )
}
