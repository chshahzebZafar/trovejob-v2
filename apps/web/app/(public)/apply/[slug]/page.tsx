import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { jobsApi } from '@/lib/api'
import ApplyForm from './ApplyForm'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const { job } = await jobsApi.get(slug)
    return { title: `Apply — ${job.title} at ${job.company.name}` }
  } catch {
    return { title: 'Apply' }
  }
}

export default async function ApplyPage({ params }: Props) {
  const { slug } = await params
  let job
  try {
    const res = await jobsApi.get(slug)
    job = res.job
  } catch {
    notFound()
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
          {job.company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={job.company.logoUrl} alt={job.company.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--gold)' }}>
              {job.company.name[0]}
            </div>
          )}
          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem', color: 'var(--warm)' }}>
            {job.company.name}
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--ink)', marginBottom: 8 }}>
          {job.title}
        </h1>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--gold)' }}>
          No account needed — just your name, email, and CV.
        </p>
      </div>

      {/* Form */}
      <ApplyForm jobId={job.id} jobTitle={job.title} companyName={job.company.name} />
    </div>
  )
}
