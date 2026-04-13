import type { ReactNode } from 'react';

/**
 * Layout for all /app/* routes.
 * Locks document scroll so the SPA container (MainLayout) is the only scroll context.
 * This does not affect the landing page or any other Next.js route.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`html { overflow: hidden; }`}</style>
      {children}
    </>
  );
}
