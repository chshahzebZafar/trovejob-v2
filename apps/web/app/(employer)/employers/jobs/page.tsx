import type { Metadata } from 'next'
import JobsClient from './JobsClient'

export const metadata: Metadata = { title: 'My Listings' }
export default function MyJobsPage() { return <JobsClient /> }
