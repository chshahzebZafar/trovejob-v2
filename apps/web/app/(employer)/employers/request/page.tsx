import type { Metadata } from 'next'
import RequestClient from './RequestClient'

export const metadata: Metadata = { title: 'Request Employer Access' }
export default function RequestPage() { return <RequestClient /> }
