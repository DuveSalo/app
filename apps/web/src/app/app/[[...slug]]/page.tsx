import { ClientOnly } from './client'

// This page is a client-only SPA — skip static generation
export const dynamic = 'force-dynamic'

export default function Page() {
    return <ClientOnly />
}
