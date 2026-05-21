import type { Metadata } from 'next'
import ApplicationsClient from './ApplicationsClient'

export const metadata: Metadata = { title: 'Applications Inbox' }
export default function ApplicationsPage() { return <ApplicationsClient /> }
