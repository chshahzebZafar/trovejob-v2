import type { Metadata } from 'next'
import ProfileClient from './ProfileClient'

export const metadata: Metadata = { title: 'Company Profile' }
export default function ProfilePage() { return <ProfileClient /> }
