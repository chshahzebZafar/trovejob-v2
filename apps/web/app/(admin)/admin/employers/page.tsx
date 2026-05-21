import type { Metadata } from 'next'
import EmployersClient from './EmployersClient'

export const metadata: Metadata = { title: 'Employers' }
export default function EmployersPage() { return <EmployersClient /> }
