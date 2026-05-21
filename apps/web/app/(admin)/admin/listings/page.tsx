import type { Metadata } from 'next'
import ListingsClient from './ListingsClient'

export const metadata: Metadata = { title: 'All Listings' }
export default function ListingsPage() { return <ListingsClient /> }
