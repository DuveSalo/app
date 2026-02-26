'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { BrowserRouter } from 'react-router-dom'

const App = dynamic(() => import('@/App'), { ssr: false })

export function ClientOnly() {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <BrowserRouter basename="/app">
            <App />
        </BrowserRouter>
    )
}
