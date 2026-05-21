import type { Metadata } from 'next'
import NewJobClient from './NewJobClient'

export const metadata: Metadata = { title: 'Post a Job' }
export default function NewJobPage() { return <NewJobClient /> }
