import type { Metadata } from 'next'
import RequestsClient from './RequestsClient'

export const metadata: Metadata = { title: 'Employer Requests' }
export default function RequestsPage() { return <RequestsClient /> }
