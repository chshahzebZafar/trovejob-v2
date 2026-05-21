import type { Metadata } from 'next'
import JobsClient from './JobsClient'

export const metadata: Metadata = { title: 'Browse Jobs' }

export default function JobsPage() {
  return <JobsClient />
}
